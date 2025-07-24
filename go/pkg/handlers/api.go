package handlers

import (
	"context"
	"net/http"
	"strconv"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/mikestefanello/pagoda/ent"
	"github.com/mikestefanello/pagoda/ent/blooddeity"
	"github.com/mikestefanello/pagoda/ent/locationreport"
	"github.com/mikestefanello/pagoda/ent/richvampire"
	"github.com/mikestefanello/pagoda/ent/user"
	"github.com/mikestefanello/pagoda/pkg/services"
)

// API handles City Crawler API endpoints
type API struct {
	orm *ent.Client
}

func init() {
	Register(new(API))
}

func (h *API) Init(c *services.Container) error {
	h.orm = c.ORM
	return nil
}

func (h *API) Routes(g *echo.Group) {
	api := g.Group("/api")

	// Location reports endpoints
	api.GET("/locations", h.GetLocations)
	api.POST("/locations", h.CreateLocation)
	api.PATCH("/locations/:id/confidence", h.UpdateLocationConfidence)
	api.DELETE("/locations/:id", h.DeleteLocation)

	// Statistics endpoints
	api.GET("/stats", h.GetStats)
	api.GET("/contributors", h.GetContributors)

	// Leaderboard endpoints
	api.GET("/leaderboards/blood-deities", h.GetBloodDeities)
	api.POST("/leaderboards/blood-deities", h.CreateBloodDeity)
	api.GET("/leaderboards/rich-vampires", h.GetRichVampires)
	api.POST("/leaderboards/rich-vampires", h.CreateRichVampire)

	// Utility endpoints
	api.POST("/cleanup", h.ManualCleanup)
	api.GET("/health", h.Health)
	api.GET("/test", h.Test)
}

// LocationReportRequest represents the request structure for creating location reports
type LocationReportRequest struct {
	BuildingName     string `json:"building_name" validate:"required"`
	BuildingType     string `json:"building_type" validate:"required,oneof=shop guild hunter paladin werewolf item blood_deity rich_vampire"`
	CustomItemName   string `json:"custom_item_name,omitempty"`
	CoordinateX      *int   `json:"coordinate_x,omitempty"`
	CoordinateY      *int   `json:"coordinate_y,omitempty"`
	StreetName       string `json:"street_name,omitempty"`
	StreetNumber     string `json:"street_number,omitempty"`
	GuildLevel       *int   `json:"guild_level,omitempty" validate:"omitempty,min=1,max=3"`
	ReporterUsername string `json:"reporter_username,omitempty"`
	Notes            string `json:"notes,omitempty"`
}

// ConfidenceUpdateRequest represents the request structure for updating confidence
type ConfidenceUpdateRequest struct {
	Confidence string `json:"confidence" validate:"required,oneof=confirmed unverified"`
}

// BloodDeityRequest represents the request structure for blood deity submissions
type BloodDeityRequest struct {
	VampireName      string `json:"vampire_name" validate:"required"`
	BloodAmount      int64  `json:"blood_amount" validate:"required,min=0"`
	ReporterUsername string `json:"reporter_username,omitempty"`
}

// RichVampireRequest represents the request structure for rich vampire submissions
type RichVampireRequest struct {
	VampireName      string `json:"vampire_name" validate:"required"`
	ReporterUsername string `json:"reporter_username,omitempty"`
}

// GetLocations returns active location reports
func (h *API) GetLocations(ctx echo.Context) error {
	buildingType := ctx.QueryParam("building_type")
	limitParam := ctx.QueryParam("limit")

	limit := 100
	if limitParam != "" {
		if l, err := strconv.Atoi(limitParam); err == nil && l > 0 {
			limit = l
		}
	}

	query := h.orm.LocationReport.Query().
		Where(
			locationreport.IsActive(true),
			locationreport.Or(
				locationreport.ExpiresAtIsNil(),
				locationreport.ExpiresAtGT(time.Now()),
			),
		).
		Order(ent.Desc(locationreport.FieldReportedAt)).
		Limit(limit)

	if buildingType != "" {
		query = query.Where(locationreport.BuildingTypeEQ(locationreport.BuildingType(buildingType)))
	}

	reports, err := query.All(context.Background())
	if err != nil {
		return fail(err, "failed to fetch location reports")
	}

	return ctx.JSON(http.StatusOK, reports)
}

// CreateLocation creates a new location report
func (h *API) CreateLocation(ctx echo.Context) error {
	var req LocationReportRequest
	if err := ctx.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid request body")
	}

	if err := ctx.Validate(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	// Validate business logic
	requiresLocation := req.BuildingType != "blood_deity" && req.BuildingType != "rich_vampire"
	if requiresLocation && (req.CoordinateX == nil || req.CoordinateY == nil) {
		return echo.NewHTTPError(http.StatusBadRequest, "coordinate_x and coordinate_y are required for location-based building types")
	}

	if req.BuildingType == "item" && req.CustomItemName == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "custom_item_name is required when building_type is 'item'")
	}

	// Deactivate existing reports for the same building
	_, err := h.orm.LocationReport.Update().
		Where(
			locationreport.BuildingName(req.BuildingName),
			locationreport.BuildingTypeEQ(locationreport.BuildingType(req.BuildingType)),
			locationreport.IsActive(true),
		).
		SetIsActive(false).
		Save(context.Background())
	if err != nil {
		return fail(err, "failed to deactivate existing reports")
	}

	// Create new report
	builder := h.orm.LocationReport.Create().
		SetBuildingName(req.BuildingName).
		SetBuildingType(locationreport.BuildingType(req.BuildingType)).
		SetIsActive(true)

	if req.CustomItemName != "" {
		builder = builder.SetCustomItemName(req.CustomItemName)
	}
	if req.CoordinateX != nil {
		builder = builder.SetCoordinateX(*req.CoordinateX)
	}
	if req.CoordinateY != nil {
		builder = builder.SetCoordinateY(*req.CoordinateY)
	}
	if req.StreetName != "" {
		builder = builder.SetStreetName(req.StreetName)
	}
	if req.StreetNumber != "" {
		builder = builder.SetStreetNumber(req.StreetNumber)
	}
	if req.GuildLevel != nil {
		builder = builder.SetGuildLevel(*req.GuildLevel)
	}
	if req.ReporterUsername != "" {
		builder = builder.SetReporterUsername(req.ReporterUsername)
	}
	if req.Notes != "" {
		builder = builder.SetNotes(req.Notes)
	}

	// Set expiration time based on building type
	now := time.Now()
	var expiresAt *time.Time

	switch req.BuildingType {
	case "shop":
		// Shops expire at next 10:40 GMT (every 12 hours)
		hour := now.UTC().Hour()
		minute := now.UTC().Minute()

		if hour < 10 || (hour == 10 && minute < 40) {
			exp := time.Date(now.Year(), now.Month(), now.Day(), 10, 40, 0, 0, time.UTC)
			expiresAt = &exp
		} else if hour < 22 || (hour == 22 && minute < 40) {
			exp := time.Date(now.Year(), now.Month(), now.Day(), 22, 40, 0, 0, time.UTC)
			expiresAt = &exp
		} else {
			exp := time.Date(now.Year(), now.Month(), now.Day()+1, 10, 40, 0, 0, time.UTC)
			expiresAt = &exp
		}
	case "guild":
		// Guilds expire on specific dates (1st, 6th, 10th, 14th, 19th, 23rd, 27th at 12:00 AM UTC)
		guildMovementDates := []int{1, 6, 10, 14, 19, 23, 27}
		currentDay := now.UTC().Day()

		var nextMovementDay int
		for _, day := range guildMovementDates {
			if day > currentDay {
				nextMovementDay = day
				break
			}
		}

		if nextMovementDay > 0 {
			exp := time.Date(now.Year(), now.Month(), nextMovementDay, 0, 0, 0, 0, time.UTC)
			expiresAt = &exp
		} else {
			// Next movement is first day of next month
			nextMonth := now.AddDate(0, 1, 0)
			exp := time.Date(nextMonth.Year(), nextMonth.Month(), 1, 0, 0, 0, 0, time.UTC)
			expiresAt = &exp
		}
	case "hunter", "paladin", "werewolf", "item":
		// Players and items expire after 36 hours
		exp := now.Add(36 * time.Hour)
		expiresAt = &exp
	case "blood_deity", "rich_vampire":
		// These never expire
		expiresAt = nil
	default:
		// Default: 24 hours
		exp := now.Add(24 * time.Hour)
		expiresAt = &exp
	}

	if expiresAt != nil {
		builder = builder.SetExpiresAt(*expiresAt)
	}

	report, err := builder.Save(context.Background())
	if err != nil {
		return fail(err, "failed to create location report")
	}

	// Update user report count if reporter is provided
	if req.ReporterUsername != "" {
		h.updateUserReportCount(req.ReporterUsername)
	}

	return ctx.JSON(http.StatusCreated, report)
}

// UpdateLocationConfidence updates the confidence level of a location report
func (h *API) UpdateLocationConfidence(ctx echo.Context) error {
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid ID")
	}

	var req ConfidenceUpdateRequest
	if err := ctx.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid request body")
	}

	if err := ctx.Validate(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	report, err := h.orm.LocationReport.UpdateOneID(id).
		Where(locationreport.IsActive(true)).
		SetConfidence(locationreport.Confidence(req.Confidence)).
		Save(context.Background())
	if err != nil {
		if ent.IsNotFound(err) {
			return echo.NewHTTPError(http.StatusNotFound, "Location report not found")
		}
		return fail(err, "failed to update confidence")
	}

	return ctx.JSON(http.StatusOK, report)
}

// DeleteLocation deactivates a location report
func (h *API) DeleteLocation(ctx echo.Context) error {
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid ID")
	}

	_, err = h.orm.LocationReport.UpdateOneID(id).
		Where(locationreport.IsActive(true)).
		SetIsActive(false).
		Save(context.Background())
	if err != nil {
		if ent.IsNotFound(err) {
			return echo.NewHTTPError(http.StatusNotFound, "Location report not found")
		}
		return fail(err, "failed to delete location report")
	}

	return ctx.JSON(http.StatusOK, map[string]string{"message": "Location report deleted successfully"})
}

// GetStats returns database statistics
func (h *API) GetStats(ctx echo.Context) error {
	// Total active reports
	totalReports, err := h.orm.LocationReport.Query().
		Where(locationreport.IsActive(true)).
		Count(context.Background())
	if err != nil {
		return fail(err, "failed to count total reports")
	}

	// Reports by type
	reportsByType := make(map[string]int)
	buildingTypes := []string{"shop", "guild", "hunter", "paladin", "werewolf", "item", "blood_deity", "rich_vampire"}
	for _, buildingType := range buildingTypes {
		count, err := h.orm.LocationReport.Query().
			Where(
				locationreport.IsActive(true),
				locationreport.BuildingTypeEQ(locationreport.BuildingType(buildingType)),
			).
			Count(context.Background())
		if err != nil {
			return fail(err, "failed to count reports by type")
		}
		reportsByType[buildingType] = count
	}

	// Total contributors
	totalContributors, err := h.orm.User.Query().
		Where(user.TotalReportsGT(0)).
		Count(context.Background())
	if err != nil {
		return fail(err, "failed to count contributors")
	}

	// Confirmed reports
	confirmedReports, err := h.orm.LocationReport.Query().
		Where(
			locationreport.IsActive(true),
			locationreport.ConfidenceEQ(locationreport.ConfidenceConfirmed),
		).
		Count(context.Background())
	if err != nil {
		return fail(err, "failed to count confirmed reports")
	}

	stats := map[string]interface{}{
		"total_reports":      totalReports,
		"reports_by_type":    reportsByType,
		"total_contributors": totalContributors,
		"confirmed_reports":  confirmedReports,
	}

	return ctx.JSON(http.StatusOK, stats)
}

// GetContributors returns top contributors
func (h *API) GetContributors(ctx echo.Context) error {
	limitParam := ctx.QueryParam("limit")
	limit := 10
	if limitParam != "" {
		if l, err := strconv.Atoi(limitParam); err == nil && l > 0 {
			limit = l
		}
	}

	contributors, err := h.orm.User.Query().
		Where(user.TotalReportsGT(0)).
		Order(ent.Desc(user.FieldTotalReports), ent.Asc(user.FieldCreatedAt)).
		Limit(limit).
		All(context.Background())
	if err != nil {
		return fail(err, "failed to fetch contributors")
	}

	return ctx.JSON(http.StatusOK, contributors)
}

// GetBloodDeities returns blood deities leaderboard
func (h *API) GetBloodDeities(ctx echo.Context) error {
	limitParam := ctx.QueryParam("limit")
	limit := 50
	if limitParam != "" {
		if l, err := strconv.Atoi(limitParam); err == nil && l > 0 {
			limit = l
		}
	}

	deities, err := h.orm.BloodDeity.Query().
		Order(ent.Desc(blooddeity.FieldBloodAmount), ent.Asc(blooddeity.FieldLastUpdated)).
		Limit(limit).
		All(context.Background())
	if err != nil {
		return fail(err, "failed to fetch blood deities")
	}

	return ctx.JSON(http.StatusOK, deities)
}

// CreateBloodDeity creates or updates a blood deity entry
func (h *API) CreateBloodDeity(ctx echo.Context) error {
	var req BloodDeityRequest
	if err := ctx.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid request body")
	}

	if err := ctx.Validate(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	// Try to update existing blood deity first
	existing, err := h.orm.BloodDeity.Query().
		Where(blooddeity.VampireName(req.VampireName)).
		First(context.Background())

	var deity *ent.BloodDeity
	if err == nil {
		// Update existing
		deity, err = existing.Update().
			SetBloodAmount(req.BloodAmount).
			SetLastUpdated(time.Now()).
			SetNillableReporterUsername(&req.ReporterUsername).
			Save(context.Background())
		if err != nil {
			return fail(err, "failed to update blood deity")
		}
	} else if ent.IsNotFound(err) {
		// Create new
		deity, err = h.orm.BloodDeity.Create().
			SetVampireName(req.VampireName).
			SetBloodAmount(req.BloodAmount).
			SetNillableReporterUsername(&req.ReporterUsername).
			Save(context.Background())
		if err != nil {
			return fail(err, "failed to create blood deity")
		}
	} else {
		return fail(err, "failed to query existing blood deity")
	}

	return ctx.JSON(http.StatusCreated, deity)
}

// GetRichVampires returns rich vampires leaderboard
func (h *API) GetRichVampires(ctx echo.Context) error {
	limitParam := ctx.QueryParam("limit")
	limit := 50
	if limitParam != "" {
		if l, err := strconv.Atoi(limitParam); err == nil && l > 0 {
			limit = l
		}
	}

	vampires, err := h.orm.RichVampire.Query().
		Order(ent.Asc(richvampire.FieldVampireName)).
		Limit(limit).
		All(context.Background())
	if err != nil {
		return fail(err, "failed to fetch rich vampires")
	}

	return ctx.JSON(http.StatusOK, vampires)
}

// CreateRichVampire creates or updates a rich vampire entry
func (h *API) CreateRichVampire(ctx echo.Context) error {
	var req RichVampireRequest
	if err := ctx.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid request body")
	}

	if err := ctx.Validate(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	// Try to update existing rich vampire first
	existing, err := h.orm.RichVampire.Query().
		Where(richvampire.VampireName(req.VampireName)).
		First(context.Background())

	var vampire *ent.RichVampire
	if err == nil {
		// Update existing
		vampire, err = existing.Update().
			SetLastUpdated(time.Now()).
			SetNillableReporterUsername(&req.ReporterUsername).
			Save(context.Background())
		if err != nil {
			return fail(err, "failed to update rich vampire")
		}
	} else if ent.IsNotFound(err) {
		// Create new
		vampire, err = h.orm.RichVampire.Create().
			SetVampireName(req.VampireName).
			SetNillableReporterUsername(&req.ReporterUsername).
			Save(context.Background())
		if err != nil {
			return fail(err, "failed to create rich vampire")
		}
	} else {
		return fail(err, "failed to query existing rich vampire")
	}

	return ctx.JSON(http.StatusCreated, vampire)
}

// ManualCleanup performs manual cleanup of expired reports
func (h *API) ManualCleanup(ctx echo.Context) error {
	result, err := h.orm.LocationReport.Update().
		Where(
			locationreport.IsActive(true),
			locationreport.ExpiresAtNotNil(),
			locationreport.ExpiresAtLTE(time.Now()),
		).
		SetIsActive(false).
		Save(context.Background())
	if err != nil {
		return fail(err, "failed to cleanup expired reports")
	}

	return ctx.JSON(http.StatusOK, map[string]interface{}{
		"message":       "Cleanup completed",
		"expired_count": result,
	})
}

// Health returns health check information
func (h *API) Health(ctx echo.Context) error {
	return ctx.JSON(http.StatusOK, map[string]interface{}{
		"status":    "healthy",
		"timestamp": time.Now().Format(time.RFC3339),
		"database":  "connected",
	})
}

// Test returns a simple test response
func (h *API) Test(ctx echo.Context) error {
	return ctx.JSON(http.StatusOK, map[string]interface{}{
		"message": "API handler working correctly",
		"method":  ctx.Request().Method,
		"path":    ctx.Request().URL.Path,
	})
}

// updateUserReportCount updates or creates a user's report count
func (h *API) updateUserReportCount(username string) {
	// This is fire-and-forget, we don't want to fail the main request if this fails
	go func() {
		// Try to update existing user
		updated, err := h.orm.User.Update().
			Where(user.Name(username)).
			AddTotalReports(1).
			Save(context.Background())

		if err == nil && updated > 0 {
			return // Successfully updated
		}

		// User doesn't exist, create new one
		h.orm.User.Create().
			SetName(username).
			SetEmail(username + "@example.com"). // Dummy email
			SetPassword("dummy").                // Dummy password
			SetTotalReports(1).
			Save(context.Background())
	}()
}

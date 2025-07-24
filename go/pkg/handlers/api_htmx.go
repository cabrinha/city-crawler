package handlers

import (
	"context"
	"strconv"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/mikestefanello/pagoda/ent"
	"github.com/mikestefanello/pagoda/ent/blooddeity"
	"github.com/mikestefanello/pagoda/ent/locationreport"
	"github.com/mikestefanello/pagoda/ent/richvampire"
	"github.com/mikestefanello/pagoda/pkg/services"
	"github.com/mikestefanello/pagoda/pkg/ui/components"
)

// HTMX handles HTMX-specific API endpoints that return HTML fragments
type HTMX struct {
	orm *ent.Client
}

func init() {
	Register(new(HTMX))
}

func (h *HTMX) Init(c *services.Container) error {
	h.orm = c.ORM
	return nil
}

func (h *HTMX) Routes(g *echo.Group) {
	htmx := g.Group("/htmx")

	// Location reports endpoints that return HTML
	htmx.GET("/locations", h.GetLocationsHTML)
	htmx.GET("/leaderboards/blood-deities", h.GetBloodDeitiesHTML)
	htmx.GET("/leaderboards/rich-vampires", h.GetRichVampiresHTML)
}

// GetLocationsHTML returns location reports as HTML table
func (h *HTMX) GetLocationsHTML(ctx echo.Context) error {
	// Get query parameters
	buildingType := ctx.QueryParam("building_type")
	isActiveParam := ctx.QueryParam("is_active")
	limitParam := ctx.QueryParam("limit")

	query := h.orm.LocationReport.Query()

	// Filter by building type
	if buildingType != "" {
		query = query.Where(locationreport.BuildingTypeEQ(locationreport.BuildingType(buildingType)))
	}

	// Filter by active status
	if isActiveParam != "" {
		isActive := isActiveParam == "true"
		query = query.Where(locationreport.IsActive(isActive))
	} else {
		// Default to only active reports
		query = query.Where(locationreport.IsActive(true))
	}

	// Limit results
	limit := 100 // Default limit
	if limitParam != "" {
		if parsedLimit, err := strconv.Atoi(limitParam); err == nil && parsedLimit > 0 {
			limit = parsedLimit
		}
	}

	query = query.Limit(limit).Order(ent.Desc(locationreport.FieldReportedAt))

	locations, err := query.All(context.Background())
	if err != nil {
		return ctx.HTML(500, "<div class='text-center py-8 text-red-400'>Error loading locations</div>")
	}

	table := components.LocationsTable(locations)
	var buf strings.Builder
	table.Render(&buf)

	return ctx.HTML(200, buf.String())
}

// GetBloodDeitiesHTML returns blood deities leaderboard as HTML table
func (h *HTMX) GetBloodDeitiesHTML(ctx echo.Context) error {
	query := h.orm.BloodDeity.Query().
		Order(ent.Desc(blooddeity.FieldBloodAmount)).
		Limit(50)

	deities, err := query.All(context.Background())
	if err != nil {
		return ctx.HTML(500, "<div class='text-center py-8 text-red-400'>Error loading blood deities</div>")
	}

	table := components.BloodDeitiesTable(deities)
	var buf strings.Builder
	table.Render(&buf)

	return ctx.HTML(200, buf.String())
}

// GetRichVampiresHTML returns rich vampires leaderboard as HTML table
func (h *HTMX) GetRichVampiresHTML(ctx echo.Context) error {
	query := h.orm.RichVampire.Query().
		Order(ent.Desc(richvampire.FieldLastUpdated)).
		Limit(50)

	vampires, err := query.All(context.Background())
	if err != nil {
		return ctx.HTML(500, "<div class='text-center py-8 text-red-400'>Error loading rich vampires</div>")
	}

	table := components.RichVampiresTable(vampires)
	var buf strings.Builder
	table.Render(&buf)

	return ctx.HTML(200, buf.String())
}

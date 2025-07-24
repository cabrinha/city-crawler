package components

import (
	"fmt"

	"github.com/mikestefanello/pagoda/ent"
	. "maragu.dev/gomponents"
	. "maragu.dev/gomponents/html"
)

func LocationsTable(locations []*ent.LocationReport) Node {
	if len(locations) == 0 {
		return Div(
			Class("text-center py-8 text-gray-400"),
			P(Text("No location reports found.")),
		)
	}

	return Div(
		Class("overflow-x-auto"),
		Table(
			Class("table table-zebra w-full text-sm"),
			THead(
				Tr(
					Class("bg-gray-800 text-white"),
					Th(Text("Building")),
					Th(Text("Type")),
					Th(Text("Coordinates")),
					Th(Text("Street")),
					Th(Text("Reporter")),
					Th(Text("Reported")),
					Th(Text("Status")),
					Th(Text("Actions")),
				),
			),
			TBody(
				mapLocations(locations)...,
			),
		),
	)
}

func locationRow(location *ent.LocationReport) Node {
	statusClass := "text-green-400"
	statusText := "Active"
	if !location.IsActive {
		statusClass = "text-red-400"
		statusText = "Expired"
	}

	coordinate := fmt.Sprintf("(%d, %d)", location.CoordinateX, location.CoordinateY)

	street := ""
	if location.StreetName != "" && location.StreetNumber != "" {
		street = fmt.Sprintf("%s %s", location.StreetNumber, location.StreetName)
	} else if location.StreetName != "" {
		street = location.StreetName
	}

	reporter := "Anonymous"
	if location.ReporterUsername != "" {
		reporter = location.ReporterUsername
	}

	return Tr(
		Class("hover:bg-gray-700"),
		Td(Text(location.BuildingName)),
		Td(
			Span(
				Class(buildingTypeClass(string(location.BuildingType))),
				Text(string(location.BuildingType)),
			),
		),
		Td(Text(coordinate)),
		Td(Text(street)),
		Td(Text(reporter)),
		Td(Text(location.ReportedAt.Format("Jan 2, 15:04"))),
		Td(
			Span(
				Class(statusClass+" font-bold"),
				Text(statusText),
			),
		),
		Td(
			Div(
				Class("flex gap-1"),
				Button(
					Class("btn btn-xs btn-primary"),
					Attr("hx-patch", fmt.Sprintf("/api/locations/%d/confirm", location.ID)),
					Attr("hx-target", "closest tr"),
					Attr("hx-swap", "outerHTML"),
					Text("Confirm"),
				),
				Button(
					Class("btn btn-xs btn-error"),
					Attr("hx-delete", fmt.Sprintf("/api/locations/%d", location.ID)),
					Attr("hx-target", "closest tr"),
					Attr("hx-swap", "delete"),
					Attr("hx-confirm", "Are you sure you want to delete this location?"),
					Text("Delete"),
				),
			),
		),
	)
}

func mapLocations(locations []*ent.LocationReport) []Node {
	result := make([]Node, len(locations))
	for i, location := range locations {
		result[i] = locationRow(location)
	}
	return result
}

func buildingTypeClass(buildingType string) string {
	switch buildingType {
	case "shop":
		return "badge badge-info"
	case "guild":
		return "badge badge-primary"
	case "hunter":
		return "badge badge-warning"
	case "paladin":
		return "badge badge-success"
	case "werewolf":
		return "badge badge-error"
	case "item":
		return "badge badge-accent"
	case "blood_deity":
		return "badge badge-error text-red-300"
	case "rich_vampire":
		return "badge badge-warning text-yellow-300"
	default:
		return "badge badge-ghost"
	}
}

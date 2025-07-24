package pages

import (
	"github.com/labstack/echo/v4"
	"github.com/mikestefanello/pagoda/pkg/ui"
	"github.com/mikestefanello/pagoda/pkg/ui/layouts"
	. "maragu.dev/gomponents"
	. "maragu.dev/gomponents/html"
)

func Locations(ctx echo.Context) error {
	r := ui.NewRequest(ctx)
	r.Title = "Location Reports"
	r.Metatags.Description = "View and manage location reports in the city"
	r.Metatags.Keywords = []string{"locations", "reports", "buildings", "city"}

	return r.Render(layouts.Primary, locationsContent(r))
}

func locationsContent(r *ui.Request) Node {
	return Group{
		locationsHeader(),
		locationsToolbar(),
		locationsTable(),
		locationReportModal(),
	}
}

func locationsHeader() Node {
	return Div(
		Class("bg-black text-white p-6"),
		Style("font-family: 'Courier New', monospace"),
		Div(
			Class("flex justify-between items-center"),
			H1(
				Class("text-3xl font-bold text-red-500"),
				Text("Location Reports"),
			),
			A(
				Href("/"),
				Class("bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-bold transition-colors"),
				Text("← Back to Map"),
			),
		),
	)
}

func locationsToolbar() Node {
	return Div(
		Class("bg-gray-900 text-white p-4 border-b border-gray-600"),
		Div(
			Class("flex flex-wrap gap-4 items-center justify-between"),
			// Filter controls
			Div(
				Class("flex gap-2 items-center"),
				Label(Class("text-sm"), Text("Filter by type:")),
				Select(
					Class("bg-gray-800 border border-gray-600 rounded px-3 py-1 text-white"),
					Attr("hx-get", "/api/locations"),
					Attr("hx-target", "#locations-table"),
					Attr("hx-trigger", "change"),
					Attr("name", "building_type"),
					Option(Value(""), Text("All Types")),
					Option(Value("shop"), Text("Shops")),
					Option(Value("guild"), Text("Guilds")),
					Option(Value("hunter"), Text("Hunters")),
					Option(Value("paladin"), Text("Paladins")),
					Option(Value("werewolf"), Text("Werewolves")),
					Option(Value("item"), Text("Items")),
					Option(Value("blood_deity"), Text("Blood Deities")),
					Option(Value("rich_vampire"), Text("Rich Vampires")),
				),
			),
			// Add new location button
			Button(
				Class("bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-bold transition-colors"),
				Attr("onclick", "document.getElementById('location-modal').showModal()"),
				Text("+ Add Location"),
			),
		),
	)
}

func locationsTable() Node {
	return Div(
		Class("bg-black text-white p-4"),
		Style("font-family: 'Courier New', monospace"),
		Div(
			ID("locations-table"),
			Attr("hx-get", "/htmx/locations"),
			Attr("hx-trigger", "load"),
			Attr("hx-swap", "innerHTML"),
			// Loading placeholder
			Div(
				Class("text-center py-8 text-gray-400"),
				Text("Loading location reports..."),
			),
		),
	)
}

func locationReportModal() Node {
	return Dialog(
		ID("location-modal"),
		Class("modal backdrop-blur"),
		Div(
			Class("modal-box bg-gray-900 text-white border border-gray-600"),
			H3(Class("font-bold text-lg mb-4"), Text("Report New Location")),
			Form(
				Attr("hx-post", "/api/locations"),
				Attr("hx-target", "#locations-table"),
				Attr("hx-on", "htmx:afterRequest: if(event.detail.successful) document.getElementById('location-modal').close()"),
				// Building name
				Div(Class("mb-4"),
					Label(Class("block text-sm font-bold mb-2"), Text("Building Name")),
					Input(
						Type("text"),
						Name("building_name"),
						Required(),
						Class("w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"),
						Placeholder("e.g., Allurists Guild"),
					),
				),
				// Building type
				Div(Class("mb-4"),
					Label(Class("block text-sm font-bold mb-2"), Text("Building Type")),
					Select(
						Name("building_type"),
						Required(),
						Class("w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"),
						Option(Value(""), Text("Select Type")),
						Option(Value("shop"), Text("Shop")),
						Option(Value("guild"), Text("Guild")),
						Option(Value("hunter"), Text("Hunter")),
						Option(Value("paladin"), Text("Paladin")),
						Option(Value("werewolf"), Text("Werewolf")),
						Option(Value("item"), Text("Item")),
						Option(Value("blood_deity"), Text("Blood Deity")),
						Option(Value("rich_vampire"), Text("Rich Vampire")),
					),
				),
				// Coordinates
				Div(Class("grid grid-cols-2 gap-4 mb-4"),
					Div(
						Label(Class("block text-sm font-bold mb-2"), Text("X Coordinate")),
						Input(
							Type("number"),
							Name("coordinate_x"),
							Min("1"),
							Max("200"),
							Class("w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"),
							Placeholder("1-200"),
						),
					),
					Div(
						Label(Class("block text-sm font-bold mb-2"), Text("Y Coordinate")),
						Input(
							Type("number"),
							Name("coordinate_y"),
							Min("1"),
							Max("200"),
							Class("w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"),
							Placeholder("1-200"),
						),
					),
				),
				// Street info
				Div(Class("grid grid-cols-2 gap-4 mb-4"),
					Div(
						Label(Class("block text-sm font-bold mb-2"), Text("Street Name")),
						Input(
							Type("text"),
							Name("street_name"),
							Class("w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"),
							Placeholder("e.g., Main St"),
						),
					),
					Div(
						Label(Class("block text-sm font-bold mb-2"), Text("Street Number")),
						Input(
							Type("text"),
							Name("street_number"),
							Class("w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"),
							Placeholder("e.g., 123"),
						),
					),
				),
				// Reporter and notes
				Div(Class("mb-4"),
					Label(Class("block text-sm font-bold mb-2"), Text("Reporter Name (Optional)")),
					Input(
						Type("text"),
						Name("reporter_username"),
						Class("w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"),
						Placeholder("Your username"),
					),
				),
				Div(Class("mb-6"),
					Label(Class("block text-sm font-bold mb-2"), Text("Notes (Optional)")),
					Textarea(
						Name("notes"),
						Rows("3"),
						Class("w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"),
						Placeholder("Additional information..."),
					),
				),
				// Buttons
				Div(Class("flex gap-2 justify-end"),
					Button(
						Type("button"),
						Class("px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"),
						Attr("onclick", "document.getElementById('location-modal').close()"),
						Text("Cancel"),
					),
					Button(
						Type("submit"),
						Class("px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"),
						Text("Submit Report"),
					),
				),
			),
		),
	)
}

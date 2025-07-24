package pages

import (
	"github.com/labstack/echo/v4"
	"github.com/mikestefanello/pagoda/pkg/ui"

	"github.com/mikestefanello/pagoda/pkg/ui/layouts"
	. "maragu.dev/gomponents"
	. "maragu.dev/gomponents/html"
)

func CityMap(ctx echo.Context) error {
	r := ui.NewRequest(ctx)
	r.Title = "Vespertine's City Crawler"
	r.Metatags.Description = "Interactive city map for location tracking and reporting"
	r.Metatags.Keywords = []string{"city", "map", "locations", "vampires", "game"}

	return r.Render(layouts.Primary, cityMapContent(r))
}

func cityMapContent(r *ui.Request) Node {
	return Group{
		cityMapHeader(r),
		cityMapContainer(),
		cityMapControls(),
	}
}

func cityMapHeader(r *ui.Request) Node {
	return Div(
		Class("fixed top-0 left-0 right-0 z-50 bg-black bg-opacity-90 border-b border-gray-600 p-4"),
		Style("font-family: 'Courier New', monospace"),
		Div(
			Class("flex justify-between items-center"),
			H1(
				Class("text-2xl text-red-500 font-bold"),
				Style("text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8)"),
				Text("Vespertine's City Crawler"),
			),
			Div(
				Class("flex gap-4 items-center text-sm"),
				gameStats(),
				navigationButtons(),
				githubLink(),
			),
		),
	)
}

func gameStats() Node {
	return Div(
		Class("flex gap-4 text-white"),
		Div(Text("AP: 8/90")),
		Div(Text("Blood: 105,449 pints")),
		Div(Text("Coins: 1,000")),
		Div(Text("Rank: Blood Deity")),
	)
}

func navigationButtons() Node {
	return Div(
		Class("flex gap-2"),
		A(
			Href("/locations"),
			Class("bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-bold transition-colors"),
			Text("Locations"),
		),
		A(
			Href("/rankings"),
			Class("bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-bold transition-colors"),
			Text("Rankings"),
		),
	)
}

func githubLink() Node {
	return A(
		Href("https://github.com/cabrinha/city-crawler"),
		Target("_blank"),
		Rel("noopener noreferrer"),
		Title("View on GitHub"),
		Class("flex items-center justify-center w-10 h-10 bg-white bg-opacity-10 border border-gray-600 rounded-lg hover:bg-opacity-20 transition-all"),
		Raw(`<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 fill-current">
			<path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.30.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
		</svg>`),
	)
}

func cityMapContainer() Node {
	return Div(
		Class("pt-20 bg-black min-h-screen text-white"),
		Style("font-family: 'Courier New', monospace"),
		Div(
			Class("container mx-auto p-4"),
			Div(
				ID("city-map-container"),
				Class("relative w-full h-screen"),
				// Canvas for TinyGo WASM map rendering
				Canvas(
					ID("city-map"),
					Class("border border-gray-600 bg-black"),
					Width("800"),
					Height("600"),
					Style("image-rendering: pixelated"),
				),
				// Map controls overlay
				Div(
					Class("absolute top-4 right-4 bg-black bg-opacity-80 p-4 rounded border border-gray-600"),
					H3(Class("text-lg font-bold mb-2"), Text("Map Controls")),
					Div(Class("space-y-2"),
						Button(
							Class("block w-full bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-sm"),
							Text("Zoom In"),
						),
						Button(
							Class("block w-full bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-sm"),
							Text("Zoom Out"),
						),
						Button(
							Class("block w-full bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-sm"),
							Text("Reset View"),
						),
					),
				),
			),
		),
	)
}

func cityMapControls() Node {
	return Div(
		Class("fixed bottom-4 left-4 bg-black bg-opacity-80 p-4 rounded border border-gray-600"),
		H3(Class("text-lg font-bold mb-2 text-white"), Text("Location Info")),
		Div(
			ID("location-info"),
			Class("space-y-1 text-sm text-gray-300"),
			Div(Text("Coordinate: Click on map")),
			Div(Text("Building: None")),
			Div(Text("Street: Click to explore")),
		),
	)
}

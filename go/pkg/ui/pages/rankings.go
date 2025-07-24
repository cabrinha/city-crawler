package pages

import (
	"github.com/labstack/echo/v4"
	"github.com/mikestefanello/pagoda/pkg/ui"
	"github.com/mikestefanello/pagoda/pkg/ui/layouts"
	. "maragu.dev/gomponents"
	. "maragu.dev/gomponents/html"
)

func Rankings(ctx echo.Context) error {
	r := ui.NewRequest(ctx)
	r.Title = "Leaderboards"
	r.Metatags.Description = "View leaderboards for blood deities and rich vampires"
	r.Metatags.Keywords = []string{"rankings", "leaderboards", "blood deities", "rich vampires"}

	return r.Render(layouts.Primary, rankingsContent(r))
}

func rankingsContent(r *ui.Request) Node {
	return Group{
		rankingsHeader(),
		rankingsTabs(),
		rankingsTabContent(),
	}
}

func rankingsHeader() Node {
	return Div(
		Class("bg-black text-white p-6"),
		Style("font-family: 'Courier New', monospace"),
		Div(
			Class("flex justify-between items-center"),
			H1(
				Class("text-3xl font-bold text-red-500"),
				Text("Leaderboards"),
			),
			A(
				Href("/"),
				Class("bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-bold transition-colors"),
				Text("← Back to Map"),
			),
		),
	)
}

func rankingsTabs() Node {
	return Div(
		Class("bg-gray-900 text-white border-b border-gray-600"),
		Div(
			Class("flex"),
			Button(
				ID("blood-deities-tab"),
				Class("flex-1 py-4 px-6 font-bold text-center border-b-2 border-red-500 bg-gray-800 hover:bg-gray-700 transition-colors"),
				Attr("onclick", "switchTab('blood-deities')"),
				Text("Blood Deities"),
			),
			Button(
				ID("rich-vampires-tab"),
				Class("flex-1 py-4 px-6 font-bold text-center border-b-2 border-transparent hover:bg-gray-700 transition-colors"),
				Attr("onclick", "switchTab('rich-vampires')"),
				Text("Rich Vampires"),
			),
			Button(
				ID("contributors-tab"),
				Class("flex-1 py-4 px-6 font-bold text-center border-b-2 border-transparent hover:bg-gray-700 transition-colors"),
				Attr("onclick", "switchTab('contributors')"),
				Text("Top Contributors"),
			),
		),
	)
}

func rankingsTabContent() Node {
	return Div(
		Class("bg-black text-white p-6"),
		Style("font-family: 'Courier New', monospace"),
		// Blood Deities Tab
		Div(
			ID("blood-deities-content"),
			Class("tab-content"),
			Div(
				Class("flex justify-between items-center mb-4"),
				H2(Class("text-xl font-bold"), Text("Blood Deities Leaderboard")),
				Button(
					Class("bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-bold transition-colors"),
					Attr("onclick", "document.getElementById('blood-deity-modal').showModal()"),
					Text("+ Add Entry"),
				),
			),
			Div(
				ID("blood-deities-table"),
				Attr("hx-get", "/htmx/leaderboards/blood-deities"),
				Attr("hx-trigger", "load"),
				Attr("hx-swap", "innerHTML"),
				Div(
					Class("text-center py-8 text-gray-400"),
					Text("Loading blood deities..."),
				),
			),
		),
		// Rich Vampires Tab
		Div(
			ID("rich-vampires-content"),
			Class("tab-content hidden"),
			Div(
				Class("flex justify-between items-center mb-4"),
				H2(Class("text-xl font-bold"), Text("Rich Vampires Leaderboard")),
				Button(
					Class("bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-bold transition-colors"),
					Attr("onclick", "document.getElementById('rich-vampire-modal').showModal()"),
					Text("+ Add Entry"),
				),
			),
			Div(
				ID("rich-vampires-table"),
				Attr("hx-get", "/htmx/leaderboards/rich-vampires"),
				Attr("hx-trigger", "load"),
				Attr("hx-swap", "innerHTML"),
				Div(
					Class("text-center py-8 text-gray-400"),
					Text("Loading rich vampires..."),
				),
			),
		),
		// Contributors Tab
		Div(
			ID("contributors-content"),
			Class("tab-content hidden"),
			H2(Class("text-xl font-bold mb-4"), Text("Top Contributors")),
			Div(
				ID("contributors-table"),
				Attr("hx-get", "/api/contributors"),
				Attr("hx-trigger", "load"),
				Attr("hx-swap", "innerHTML"),
				Div(
					Class("text-center py-8 text-gray-400"),
					Text("Loading contributors..."),
				),
			),
		),
		// Modals
		bloodDeityModal(),
		richVampireModal(),
		// Tab switching script
		Script(Raw(`
			function switchTab(tabName) {
				// Hide all tab contents
				document.querySelectorAll('.tab-content').forEach(content => {
					content.classList.add('hidden');
				});

				// Remove active state from all tabs
				document.querySelectorAll('[id$="-tab"]').forEach(tab => {
					tab.classList.remove('border-red-500', 'bg-gray-800');
					tab.classList.add('border-transparent');
				});

				// Show selected tab content
				document.getElementById(tabName + '-content').classList.remove('hidden');

				// Add active state to selected tab
				const activeTab = document.getElementById(tabName + '-tab');
				activeTab.classList.add('border-red-500', 'bg-gray-800');
				activeTab.classList.remove('border-transparent');
			}
		`)),
	)
}

func bloodDeityModal() Node {
	return Dialog(
		ID("blood-deity-modal"),
		Class("modal backdrop-blur"),
		Div(
			Class("modal-box bg-gray-900 text-white border border-gray-600"),
			H3(Class("font-bold text-lg mb-4"), Text("Add Blood Deity Entry")),
			Form(
				Attr("hx-post", "/api/leaderboards/blood-deities"),
				Attr("hx-target", "#blood-deities-table"),
				Attr("hx-on", "htmx:afterRequest: if(event.detail.successful) document.getElementById('blood-deity-modal').close()"),
				Div(Class("mb-4"),
					Label(Class("block text-sm font-bold mb-2"), Text("Vampire Name")),
					Input(
						Type("text"),
						Name("vampire_name"),
						Required(),
						Class("w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"),
						Placeholder("e.g., Dracula"),
					),
				),
				Div(Class("mb-4"),
					Label(Class("block text-sm font-bold mb-2"), Text("Blood Amount")),
					Input(
						Type("number"),
						Name("blood_amount"),
						Required(),
						Min("0"),
						Class("w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"),
						Placeholder("e.g., 105449"),
					),
				),
				Div(Class("mb-6"),
					Label(Class("block text-sm font-bold mb-2"), Text("Reporter Name (Optional)")),
					Input(
						Type("text"),
						Name("reporter_username"),
						Class("w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"),
						Placeholder("Your username"),
					),
				),
				Div(Class("flex gap-2 justify-end"),
					Button(
						Type("button"),
						Class("px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"),
						Attr("onclick", "document.getElementById('blood-deity-modal').close()"),
						Text("Cancel"),
					),
					Button(
						Type("submit"),
						Class("px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"),
						Text("Add Entry"),
					),
				),
			),
		),
	)
}

func richVampireModal() Node {
	return Dialog(
		ID("rich-vampire-modal"),
		Class("modal backdrop-blur"),
		Div(
			Class("modal-box bg-gray-900 text-white border border-gray-600"),
			H3(Class("font-bold text-lg mb-4"), Text("Add Rich Vampire Entry")),
			Form(
				Attr("hx-post", "/api/leaderboards/rich-vampires"),
				Attr("hx-target", "#rich-vampires-table"),
				Attr("hx-on", "htmx:afterRequest: if(event.detail.successful) document.getElementById('rich-vampire-modal').close()"),
				Div(Class("mb-4"),
					Label(Class("block text-sm font-bold mb-2"), Text("Vampire Name")),
					Input(
						Type("text"),
						Name("vampire_name"),
						Required(),
						Class("w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"),
						Placeholder("e.g., Count Moneybags"),
					),
				),
				Div(Class("mb-6"),
					Label(Class("block text-sm font-bold mb-2"), Text("Reporter Name (Optional)")),
					Input(
						Type("text"),
						Name("reporter_username"),
						Class("w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"),
						Placeholder("Your username"),
					),
				),
				Div(Class("flex gap-2 justify-end"),
					Button(
						Type("button"),
						Class("px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"),
						Attr("onclick", "document.getElementById('rich-vampire-modal').close()"),
						Text("Cancel"),
					),
					Button(
						Type("submit"),
						Class("px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"),
						Text("Add Entry"),
					),
				),
			),
		),
	)
}

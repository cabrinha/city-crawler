package components

import (
	"fmt"

	"github.com/mikestefanello/pagoda/ent"
	. "maragu.dev/gomponents"
	. "maragu.dev/gomponents/html"
)

func BloodDeitiesTable(deities []*ent.BloodDeity) Node {
	if len(deities) == 0 {
		return Div(
			Class("text-center py-8 text-gray-400"),
			P(Text("No blood deities found. Be the first to add one!")),
		)
	}

	return Div(
		Class("overflow-x-auto"),
		Table(
			Class("table table-zebra w-full text-sm"),
			THead(
				Tr(
					Class("bg-gray-800 text-white"),
					Th(Text("Rank")),
					Th(Text("Vampire Name")),
					Th(Text("Blood Amount")),
					Th(Text("Reporter")),
					Th(Text("Last Updated")),
					Th(Text("Actions")),
				),
			),
			TBody(
				mapBloodDeities(deities)...,
			),
		),
	)
}

func RichVampiresTable(vampires []*ent.RichVampire) Node {
	if len(vampires) == 0 {
		return Div(
			Class("text-center py-8 text-gray-400"),
			P(Text("No rich vampires found. Be the first to add one!")),
		)
	}

	return Div(
		Class("overflow-x-auto"),
		Table(
			Class("table table-zebra w-full text-sm"),
			THead(
				Tr(
					Class("bg-gray-800 text-white"),
					Th(Text("Rank")),
					Th(Text("Vampire Name")),
					Th(Text("Reporter")),
					Th(Text("Last Updated")),
					Th(Text("Actions")),
				),
			),
			TBody(
				mapRichVampires(vampires)...,
			),
		),
	)
}

func mapBloodDeities(deities []*ent.BloodDeity) []Node {
	result := make([]Node, len(deities))
	for i, deity := range deities {
		result[i] = bloodDeityRow(deity, i+1)
	}
	return result
}

func mapRichVampires(vampires []*ent.RichVampire) []Node {
	result := make([]Node, len(vampires))
	for i, vampire := range vampires {
		result[i] = richVampireRow(vampire, i+1)
	}
	return result
}

func bloodDeityRow(deity *ent.BloodDeity, rank int) Node {
	reporter := "Anonymous"
	if deity.ReporterUsername != "" {
		reporter = deity.ReporterUsername
	}

	return Tr(
		Class("hover:bg-gray-700"),
		Td(
			Span(
				Class("badge badge-primary text-lg font-bold"),
				Text(fmt.Sprintf("#%d", rank)),
			),
		),
		Td(
			Span(
				Class("text-red-400 font-bold text-lg"),
				Text(deity.VampireName),
			),
		),
		Td(
			Span(
				Class("text-red-300 font-mono"),
				Text(formatBloodAmount(deity.BloodAmount)),
			),
		),
		Td(Text(reporter)),
		Td(Text(deity.LastUpdated.Format("Jan 2, 15:04"))),
		Td(
			Button(
				Class("btn btn-xs btn-error"),
				Attr("hx-delete", fmt.Sprintf("/api/leaderboards/blood-deities/%d", deity.ID)),
				Attr("hx-target", "closest tr"),
				Attr("hx-swap", "delete"),
				Attr("hx-confirm", "Are you sure you want to delete this entry?"),
				Text("Delete"),
			),
		),
	)
}

func richVampireRow(vampire *ent.RichVampire, rank int) Node {
	reporter := "Anonymous"
	if vampire.ReporterUsername != "" {
		reporter = vampire.ReporterUsername
	}

	return Tr(
		Class("hover:bg-gray-700"),
		Td(
			Span(
				Class("badge badge-warning text-lg font-bold"),
				Text(fmt.Sprintf("#%d", rank)),
			),
		),
		Td(
			Span(
				Class("text-yellow-400 font-bold text-lg"),
				Text(vampire.VampireName),
			),
		),
		Td(Text(reporter)),
		Td(Text(vampire.LastUpdated.Format("Jan 2, 15:04"))),
		Td(
			Button(
				Class("btn btn-xs btn-error"),
				Attr("hx-delete", fmt.Sprintf("/api/leaderboards/rich-vampires/%d", vampire.ID)),
				Attr("hx-target", "closest tr"),
				Attr("hx-swap", "delete"),
				Attr("hx-confirm", "Are you sure you want to delete this entry?"),
				Text("Delete"),
			),
		),
	)
}

func formatBloodAmount(amount int64) string {
	if amount >= 1000000 {
		return fmt.Sprintf("%.1fM pints", float64(amount)/1000000)
	} else if amount >= 1000 {
		return fmt.Sprintf("%.1fK pints", float64(amount)/1000)
	}
	return fmt.Sprintf("%d pints", amount)
}

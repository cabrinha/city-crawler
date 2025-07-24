package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

// LocationReport holds the schema definition for the LocationReport entity.
type LocationReport struct {
	ent.Schema
}

// Fields of the LocationReport.
func (LocationReport) Fields() []ent.Field {
	return []ent.Field{
		field.String("building_name").
			NotEmpty().
			Comment("Name of the building"),
		field.Enum("building_type").
			Values("shop", "guild", "hunter", "paladin", "werewolf", "item", "blood_deity", "rich_vampire").
			Comment("Type of building"),
		field.String("custom_item_name").
			Optional().
			Comment("Custom item name when building_type is 'item'"),
		field.Int("coordinate_x").
			Optional().
			Min(1).
			Max(200).
			Comment("X coordinate (1-200)"),
		field.Int("coordinate_y").
			Optional().
			Min(1).
			Max(200).
			Comment("Y coordinate (1-200)"),
		field.String("street_name").
			Optional().
			Comment("Street name"),
		field.String("street_number").
			Optional().
			Comment("Street number"),
		field.Int("guild_level").
			Optional().
			Min(1).
			Max(3).
			Comment("Guild level (1-3) for guild buildings"),
		field.String("reporter_username").
			Optional().
			Comment("Username of the reporter"),
		field.Int("reporter_id").
			Optional().
			Comment("ID of the reporter user"),
		field.Enum("confidence").
			Values("confirmed", "unverified").
			Default("unverified").
			Comment("Confidence level of the report"),
		field.String("notes").
			Optional().
			Comment("Additional notes about the location"),
		field.Time("reported_at").
			Default(time.Now).
			Immutable().
			Comment("When the report was created"),
		field.Time("expires_at").
			Optional().
			Comment("When this report expires"),
		field.Bool("is_active").
			Default(true).
			Comment("Whether this report is active"),
	}
}

// Edges of the LocationReport.
func (LocationReport) Edges() []ent.Edge {
	return []ent.Edge{
		edge.To("reporter", User.Type).
			Field("reporter_id").
			Unique(),
	}
}

// Indexes of the LocationReport.
func (LocationReport) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("building_type"),
		index.Fields("coordinate_x", "coordinate_y"),
		index.Fields("is_active", "expires_at"),
		index.Fields("reporter_id"),
		index.Fields("reported_at"),
	}
}

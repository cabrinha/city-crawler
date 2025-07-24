package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

// RichVampire holds the schema definition for the RichVampire entity.
type RichVampire struct {
	ent.Schema
}

// Fields of the RichVampire.
func (RichVampire) Fields() []ent.Field {
	return []ent.Field{
		field.String("vampire_name").
			NotEmpty().
			Unique().
			Comment("Name of the vampire"),
		field.Time("last_updated").
			Default(time.Now).
			Comment("When this entry was last updated"),
		field.String("reporter_username").
			Optional().
			Comment("Username of the reporter"),
		field.Int("reporter_id").
			Optional().
			Comment("ID of the reporter user"),
	}
}

// Edges of the RichVampire.
func (RichVampire) Edges() []ent.Edge {
	return []ent.Edge{
		edge.To("reporter", User.Type).
			Field("reporter_id").
			Unique(),
	}
}

// Indexes of the RichVampire.
func (RichVampire) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("vampire_name"),
		index.Fields("reporter_id"),
	}
}

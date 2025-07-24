package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

// BloodDeity holds the schema definition for the BloodDeity entity.
type BloodDeity struct {
	ent.Schema
}

// Fields of the BloodDeity.
func (BloodDeity) Fields() []ent.Field {
	return []ent.Field{
		field.String("vampire_name").
			NotEmpty().
			Unique().
			Comment("Name of the vampire"),
		field.Int64("blood_amount").
			Default(0).
			Min(0).
			Comment("Amount of blood the vampire has"),
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

// Edges of the BloodDeity.
func (BloodDeity) Edges() []ent.Edge {
	return []ent.Edge{
		edge.To("reporter", User.Type).
			Field("reporter_id").
			Unique(),
	}
}

// Indexes of the BloodDeity.
func (BloodDeity) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("blood_amount"),
		index.Fields("reporter_id"),
		index.Fields("vampire_name"),
	}
}

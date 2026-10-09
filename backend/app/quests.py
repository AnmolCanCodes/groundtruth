from sqlalchemy.orm import Session
from app.models import Quest

QUEST_DATA = [
("Find three outdoor colors","Find three clearly different colors in nature or on public buildings.","morning","easy",5,"Photograph the three colors together or in separate images.","colors"),
("Catch an interesting shadow","Find a naturally occurring shadow pattern from a safe public spot.","morning","easy",5,"Upload a photo where the shadow is visible.","light"),
("Leaf-shape collection","Observe three different leaf shapes without picking or touching plants.","morning","easy",8,"Photograph leaves in place; do not touch unknown plants.","nature"),
("Sky reflection","Photograph the sky reflected in a puddle or window.","morning","easy",5,"Make the reflection clearly visible.","reflection"),
("Notice tiny textures","Find an interesting texture on a public path, rock, or tree bark.","morning","easy",6,"Take a close photo without disturbing nature.","texture"),
("Cloud imagination","Look at clouds and photograph an unusual shape from a safe location.","morning","easy",5,"Include the cloud shape in the frame.","sky"),
("A line in nature","Find a natural line made by branches, grass, or a landscape.","morning","easy",7,"Compose a photo that makes the line easy to see.","composition"),
("Morning light geometry","Photograph light and shadow making a geometric shape.","morning","medium",10,"Show the light pattern clearly.","light"),
("Three kinds of green","Capture three different shades of green in one safe public area.","morning","easy",8,"The different shades should be distinguishable.","nature"),
("Tiny world, big detail","Photograph a small outdoor detail you normally overlook.","morning","medium",10,"Keep the detail in focus.","observation"),
("Architectural detail","Find and photograph an interesting detail on a public building.","evening","easy",8,"Do not enter private property or include identifiable strangers.","architecture"),
("Golden-hour silhouette","Capture a safe, stationary silhouette against the evening sky.","evening","medium",10,"Keep a safe distance from roads and edges.","photography"),
("A repeating pattern","Photograph a repeating pattern on a public wall, pavement, or fence.","evening","easy",6,"Frame at least three repetitions.","patterns"),
("Nature's symmetry","Find a symmetrical natural form and photograph it in place.","evening","medium",10,"Do not pick or handle plants.","nature"),
("Warm versus cool","Photograph warm and cool colors in the same outdoor scene.","evening","medium",10,"Both color groups should be visible.","colors"),
("A doorway detail","Capture an unusual doorway, gate, or window detail from public space.","evening","easy",7,"Respect private property and people's privacy.","architecture"),
("Wind evidence","Photograph something safely showing the effect of wind, such as moving leaves.","evening","easy",6,"Stay away from traffic and unstable objects.","weather"),
("Path perspective","Photograph perspective lines along a safe pedestrian path.","evening","medium",10,"Remain on the pedestrian area.","composition"),
("Nature's circles","Find circles in a public outdoor environment.","evening","easy",7,"Photograph at least two circular forms.","shapes"),
("A color anchor","Choose one color and photograph three outdoor objects featuring it.","evening","medium",10,"Do not move objects to stage the scene.","colors"),
("Window to the sky","From a safe, accessible public area, photograph sky framed by architecture.","night","easy",5,"Night quests are optional; stay in a well-lit public place.","sky"),
("Moon or bright planet","If visible, photograph the moon or a bright planet from a safe place; otherwise photograph the night sky.","night","medium",10,"Do not go to isolated places or use roadsides.","sky"),
("Night-light reflection","Photograph a reflection of a public light on a safe surface.","night","medium",10,"Stay in a well-lit public area and away from traffic.","reflection"),
("Geometric night lights","Capture a geometric arrangement of lights from a safe public spot.","night","medium",10,"Do not photograph private interiors or strangers.","light"),
("Night color contrast","Find two contrasting colors in a well-lit public place.","night","easy",7,"Remain in a familiar, safe location.","colors"),
("A lit-up pattern","Photograph a repeating pattern of lights from a public pedestrian area.","night","medium",10,"Never cross a road or enter restricted property for a photo.","patterns"),
("Quiet sky frame","Frame a small patch of night sky between buildings or trees.","night","easy",5,"Only attempt this from a safe, accessible place.","sky"),
("Texture after dark","Photograph an interesting texture under safe public lighting.","night","medium",8,"Do not touch unknown objects or plants.","texture"),
("Light and outline","Find an object outlined by public lighting and photograph it.","night","easy",7,"Stay in a well-lit public area.","composition"),
("One bright detail","Photograph one visually striking detail in a public outdoor space at night.","night","easy",5,"Night activity is optional; do not visit isolated places.","observation"),
]

def seed_quests(db: Session):
    if db.query(Quest).count():
        return
    for title, desc, slot, diff, mins, proof, category in QUEST_DATA:
        db.add(Quest(title=title, description=desc, time_slot=slot, difficulty=diff,
                     estimated_minutes=mins, proof_instructions=proof,
                     base_xp={"easy":30,"medium":50,"hard":70}[diff],
                     category=category, safety_notes="Stay in a safe, publicly accessible place. Never trespass, approach wildlife, cross roads for photos, climb structures, or photograph strangers.", is_active=True))
    db.commit()

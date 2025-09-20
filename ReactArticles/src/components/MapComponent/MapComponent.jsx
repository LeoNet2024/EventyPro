// src/components/MapComponent/MapComponent.jsx

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./MapComponent.css";
import EventDetailsForMarks from "../EventDetailsForMarks/eventDetailsForMarks";

// Default icon fix for Leaflet with Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

export default function MapComponent({
  center = [32.0853, 34.7818],
  markers = [],
  events,
}) {
  const finalListOfEvents = [];
  const temp = events.map((el) => {
    const foundEvent = markers.find((mark) => mark.event_id === el.event_id);

    if (foundEvent) {
      finalListOfEvents.push(foundEvent);
    }
  });

  return (
    <MapContainer
      center={center}
      zoom={10}
      scrollWheelZoom={true}
      style={{ height: "400px", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {finalListOfEvents.map((marker, idx) => (
        <Marker key={idx} position={marker.position}>
          <Popup>
            {/* <b>{marker.name}</b>
            <br />
            {marker.description} */}
            <EventDetailsForMarks
              event={marker}
              description={marker.description}
              name={marker.name}
            />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

const socket = io();

if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            let { latitude, longitude } = position.coords;
            const offset = Math.random() * 0.0003; // Add a small random offset
            latitude += offset; // This will make each tab have a slightly different latitude
            console.log("Tab Location Emitting:", latitude, longitude);
            socket.emit("send-location", { latitude, longitude });
        },
        (error) => {
            console.error("Geolocation error:", error);
        },
        {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 5000,
        }
    );
}
 else {
    console.error("Geolocation not supported by this browser.");
}


// Leaflet map setup
const map = L.map("map").setView([0, 0], 16);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "Your Attribution",
}).addTo(map);

const markers = {};

// Handle location updates
socket.on("receive-location", (data) => {
    const { id, latitude, longitude } = data;
    console.log("Location received:", data);
    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
    } else {
        markers[id] = L.marker([latitude, longitude]).addTo(map);
    }

    // Dynamically adjust map bounds to fit all markers
    const allLatLngs = Object.values(markers).map((marker) => marker.getLatLng());
    const bounds = L.latLngBounds(allLatLngs);
    map.fitBounds(bounds);
});


// Handle user disconnection
socket.on("user-disconnected", (id) => {
    console.log("User disconnected:", id);
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import {
	useMapEvents,
	MapContainer,
	TileLayer,
	Marker,
	Popup,
	Polyline,
	useMap,
} from "react-leaflet";

import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

import { decode } from "@mapbox/polyline";

interface RouteData {
	coordinates: [number, number][];
	distance: number;
	duration: number;
}

const DynamicMap = dynamic(
	() => import("react-leaflet").then((mod) => mod.MapContainer),
	{
		ssr: false,
		loading: () => <p>Loading Map...</p>,
	}
);

const AutoCenterControl = ({
	coords,
	isAutoCenter,
	setIsAutoCenter,
}: {
	coords: [number, number] | null;
	isAutoCenter: boolean;
	setIsAutoCenter: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
	const map = useMap();
	const buttonRef = useRef<HTMLButtonElement>(null);

	const toggleAutoCenter = useCallback(() => {
		setIsAutoCenter((prev) => !prev);
	}, [setIsAutoCenter]);

	useEffect(() => {
		if (buttonRef.current) {
			L.DomEvent.disableClickPropagation(buttonRef.current);
		}
	}, []);

	useEffect(() => {
		if (isAutoCenter && coords) {
			map.setView(coords, map.getZoom(), {
				animate: true,
				duration: 1,
			});
		}
	}, [isAutoCenter, coords, map]);

	return (
		<button
			ref={buttonRef}
			onClick={toggleAutoCenter}
			style={{
				position: "absolute",
				top: "10px",
				right: "10px",
				zIndex: 1000,
				padding: "5px 10px",
				backgroundColor: isAutoCenter ? "lightblue" : "white",
				border: "2px solid #ccc",
				borderRadius: "5px",
				cursor: "pointer",
			}}
		>
			{isAutoCenter ? "Disable Auto Center" : "Enable Auto Center"}
		</button>
	);
};

const MapEvents = ({
	onMapClick,
}: {
	onMapClick: (lat: number, lng: number) => void;
}) => {
	useMapEvents({
		click(e) {
			const { lat, lng } = e.latlng;
			onMapClick(lat, lng);
		},
	});
	return null;
};

const MapComponent: React.FC = () => {
	const [currentPosition, setCurrentPosition] = useState<
		[number, number] | null
	>(null);
	const [isAutoCenter, setIsAutoCenter] = useState(false);
	const [startPoint, setStartPoint] = useState<[number, number] | null>(null);
	const [endPoint, setEndPoint] = useState<[number, number] | null>(null);
	const [route, setRoute] = useState<RouteData | null>(null);
	const [transportMode, setTransportMode] = useState<
		"driving-car" | "cycling-regular"
	>("driving-car");

	const fetchRoute = useCallback(async () => {
		if (!startPoint || !endPoint) return;

		const apiKey = process.env.NEXT_PUBLIC_OPENROUTE_API_KEY;

		if (!apiKey) {
			console.error("API key is not set");
			return;
		}

		try {
			const response = await axios.post(
				`https://api.openrouteservice.org/v2/directions/${transportMode}`,
				{
					coordinates: [
						[startPoint[1], startPoint[0]],
						[endPoint[1], endPoint[0]],
					],
				},
				{
					headers: {
						Authorization: apiKey,
						"Content-Type": "application/json",
					},
				}
			);

			const { distance, duration } = response.data.routes[0].summary;
			const encodedPolyline = response.data.routes[0].geometry;
			const decodedCoordinates = decode(encodedPolyline);

			setRoute({
				coordinates: decodedCoordinates,
				distance: distance / 1000,
				duration: duration / 60,
			});
		} catch (error) {
			console.error("Error fetching route:", error);
			if (axios.isAxiosError(error) && error.response) {
				console.error("Response status:", error.response.status);
				console.error("Response data:", error.response.data);
			}
		}
	}, [startPoint, endPoint, transportMode]);

	useEffect(() => {
		if (startPoint && endPoint) {
			fetchRoute();
		}
	}, [startPoint, endPoint, transportMode, fetchRoute]);

	const handleMapClick = (lat: number, lng: number) => {
		if (!startPoint) {
			setStartPoint([lat, lng]);
		} else if (!endPoint) {
			setEndPoint([lat, lng]);
		} else {
			setStartPoint([lat, lng]);
			setEndPoint(null);
			setRoute(null);
		}
	};

	const updateCurrentPosition = useCallback(() => {
		if ("geolocation" in navigator) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					const { latitude, longitude } = position.coords;
					setCurrentPosition([latitude, longitude]);
				},
				(error) => {
					console.error("Error getting current position:", error);
				}
			);
		} else {
			console.error("Geolocation is not supported by this browser.");
		}
	}, []);

	useEffect(() => {
		updateCurrentPosition();
		const intervalId = setInterval(updateCurrentPosition, 2000);

		return () => clearInterval(intervalId);
	}, [updateCurrentPosition]);

	return (
		<div>
			<div className="p-4 flex gap-4 text-2xl">
				<label>
					<input
						type="radio"
						value="driving-car"
						checked={transportMode === "driving-car"}
						onChange={() => setTransportMode("driving-car")}
					/>{" "}
					차량
				</label>
				<label>
					<input
						type="radio"
						value="cycling-regular"
						checked={transportMode === "cycling-regular"}
						onChange={() => setTransportMode("cycling-regular")}
					/>{" "}
					자전거
				</label>
				<p>출발지점과 도착지점을 선택해주세요!</p>
			</div>
			{currentPosition && (
				<div style={{ position: "relative", height: "80vh", width: "100%" }}>
					<DynamicMap
						center={currentPosition}
						zoom={16}
						style={{ height: "100%", width: "100%", zIndex: 1 }}
					>
						<TileLayer
							url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
							attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
						/>
						<AutoCenterControl
							coords={currentPosition}
							isAutoCenter={isAutoCenter}
							setIsAutoCenter={setIsAutoCenter}
						/>
						<MapEvents onMapClick={handleMapClick} />
						<Marker position={currentPosition}>
							<Popup>현재 위치</Popup>
						</Marker>
						{startPoint && (
							<Marker position={startPoint} icon={BycleIcon}>
								<Popup>출발 지점</Popup>
							</Marker>
						)}
						{endPoint && (
							<Marker position={endPoint} icon={EndIcon}>
								<Popup>도착 지점</Popup>
							</Marker>
						)}
						{route && <Polyline positions={route.coordinates} color="blue" />}
					</DynamicMap>
					{route && (
						<div
							style={{
								position: "absolute",
								bottom: "10px",
								right: "10px",
								zIndex: 1000,
								padding: "5px 10px",
								backgroundColor: "white",
								border: "2px solid #ccc",
								borderRadius: "5px",
							}}
						>
							<p>총 거리: {route.distance.toFixed(2)} km</p>
							<p>소요 시간: {route.duration.toFixed(0)} 분</p>
						</div>
					)}
				</div>
			)}
		</div>
	);
};

const DefaultIcon = L.icon({
	iconUrl: icon.src,
	shadowUrl: iconShadow.src,
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41],
});

const EndIcon = L.icon({
	iconUrl: "/end.png",
	shadowUrl: iconShadow.src,
	iconSize: [41, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41],
});

const BycleIcon = L.icon({
	iconUrl: "/bycle.png",
	shadowUrl: iconShadow.src,
	iconSize: [41, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

export default MapComponent;
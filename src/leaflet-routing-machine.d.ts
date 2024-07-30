import * as L from "leaflet";

declare module "leaflet" {
	namespace Routing {
		interface RoutingControlOptions extends L.ControlOptions {
			waypoints: L.LatLng[];
			routeWhileDragging?: boolean;
			lineOptions?: any;
			show?: boolean;
			addWaypoints?: boolean;
			draggableWaypoints?: boolean;
			fitSelectedRoutes?: boolean;
			showAlternatives?: boolean;
		}

		class Control extends L.Control {
			constructor(options: RoutingControlOptions);
			addTo(map: L.Map): this;
			setWaypoints(waypoints: L.LatLng[]): this;
			spliceWaypoints(
				index: number,
				waypointsToRemove: number,
				...waypoints: L.LatLng[]
			): this;
		}

		function control(options: RoutingControlOptions): Control;
	}
}

declare module "leaflet" {
	namespace Routing {
		interface RoutingControlOptions {
			router?: any;
		}

		namespace Osrm {
			interface Options {
				serviceUrl: string;
			}
		}

		function osrmv1(options?: Osrm.Options): any;
	}
}

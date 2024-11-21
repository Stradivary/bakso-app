import L from "leaflet";
import markerPerson from "@/shared/assets/cust.svg";
import markerBakso from "@/shared/assets/seller.svg";

const iconPerson = new L.Icon({
  iconUrl: markerPerson,
  iconSize: new L.Point(32, 49),
});

const iconBakso = new L.Icon({
  iconUrl: markerBakso,
  iconSize: new L.Point(32, 49),
});

export { iconPerson, iconBakso };

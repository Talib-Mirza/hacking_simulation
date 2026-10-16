import { useId } from "react";
import "./NetworkMap.css";

type NetworkMapProps = {
  compact?: boolean;
  chapter?: number;
  active?: boolean;
};

// The map is deliberately schematic: every host belongs to the story's closed lab.
const districts = [
  { x: 220, y: 237, name: "MERIDIAN HQ", number: "01", buildings: 14 },
  { x: 466, y: 127, name: "PUBLIC EDGE", number: "02", buildings: 11 },
  { x: 589, y: 293, name: "RELAY 07", number: "03", buildings: 13 },
  { x: 784, y: 166, name: "ARCHIVE", number: "04", buildings: 10 },
];

const routes = [
  "M220 237 L318 237 L363 192 L363 127 L466 127",
  "M220 237 L300 237 L356 293 L589 293",
  "M466 127 L501 162 L501 205 L589 293",
  "M466 127 L655 127 L694 166 L784 166",
  "M589 293 L678 293 L740 231 L740 210 L784 166",
  "M784 166 L847 166 L888 207 L932 207",
];

const buildings = districts.flatMap((district, d) =>
  Array.from({ length: district.buildings }, (_, i) => {
    const ring = Math.floor(i / 5);
    const offset = i % 5;
    const side = i % 2 === 0 ? 1 : -1;
    return {
      x: district.x + (offset - 2) * 25 + ring * 14,
      y: district.y + side * (36 + ring * 24) + (offset - 2) * 6,
      width: 10 + ((i + d) % 3) * 5,
      height: 8 + ((i * 2 + d) % 3) * 5,
      key: `${d}-${i}`,
      light: i % 5 === 0,
    };
  }),
);

export default function NetworkMap({
  compact = false,
  chapter = 1,
  active = true,
}: NetworkMapProps) {
  const uid = useId().replace(/:/g, "");
  const showThreat = chapter > 1;

  return (
    <div
      className={`network-map${compact ? " network-map--compact" : ""}${active ? " network-map--active" : ""}`}
    >
      <div className="network-map__ambient" aria-hidden="true" />
      <svg
        className="network-map__canvas"
        viewBox="0 0 1000 430"
        role="img"
        aria-label="Meridian's network. Headquarters connects to the public edge, Relay 07, and the archive. An unidentified signal is visible beyond the perimeter."
      >
        <defs>
          <pattern
            id={`${uid}-grid`}
            width="29"
            height="29"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(-28 500 210)"
          >
            <path
              d="M29 0H0V29"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.55"
            />
          </pattern>
          <radialGradient id={`${uid}-fade`}>
            <stop offset="0%" stopColor="white" stopOpacity="0.95" />
            <stop offset="78%" stopColor="white" stopOpacity="0.7" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id={`${uid}-mask`}>
            <ellipse
              cx="510"
              cy="215"
              rx="500"
              ry="220"
              fill={`url(#${uid}-fade)`}
            />
          </mask>
          <filter
            id={`${uid}-glow`}
            x="-100%"
            y="-100%"
            width="300%"
            height="300%"
          >
            <feGaussianBlur stdDeviation="3" />
          </filter>
          <linearGradient id={`${uid}-route`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#97e9bb" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#80c8a0" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        <g mask={`url(#${uid}-mask)`}>
          <rect
            width="1000"
            height="430"
            fill={`url(#${uid}-grid)`}
            className="network-map__grid"
          />
          <g className="network-map__contours">
            {[0, 1, 2, 3, 4, 5].map((ring) => (
              <path
                key={ring}
                d={`M${67 - ring * 27} ${205 - ring * 16} L${225 - ring * 5} ${79 - ring * 21} L${539 + ring * 19} ${49 - ring * 15} L${801 + ring * 21} ${112 - ring * 7} L${935 + ring * 19} ${237 + ring * 9} L${754 + ring * 13} ${358 + ring * 16} L${399 - ring * 16} ${381 + ring * 20} L${133 - ring * 25} ${303 + ring * 17} Z`}
              />
            ))}
          </g>

          <g className="network-map__streets">
            <path d="M98 246L265 149L419 149L579 57M140 324L354 201L697 201L863 105M262 378L471 258L685 258L858 358M348 79L348 151L442 245L442 363M637 66L637 163L706 232L706 342M139 137L193 191L193 280L255 342M832 91L832 254L770 316" />
            <path d="M118 266L286 169L439 169L593 80M166 343L374 221L697 221L884 114M289 395L485 278L677 278L847 376M369 66L369 143L462 236L462 371" />
          </g>

          <g className="network-map__buildings">
            {buildings.map((building) => (
              <g
                key={building.key}
                transform={`translate(${building.x} ${building.y}) rotate(-28)`}
              >
                <rect
                  x="-2"
                  y="3"
                  width={building.width}
                  height={building.height}
                  className="network-map__building-shadow"
                />
                <rect
                  width={building.width}
                  height={building.height}
                  className={
                    building.light
                      ? "network-map__building network-map__building--lit"
                      : "network-map__building"
                  }
                />
                <path
                  d={`M2 ${building.height - 2}H${building.width - 2}`}
                  className="network-map__building-floor"
                />
              </g>
            ))}
          </g>

          <g className="network-map__routes">
            {routes.slice(0, 5).map((route, i) => (
              <path
                key={i}
                d={route}
                fill="none"
                stroke={`url(#${uid}-route)`}
              />
            ))}
            <path d={routes[5]} className="network-map__unknown-route" />
          </g>
          <g className="network-map__route-glow" filter={`url(#${uid}-glow)`}>
            <path d={routes[0]} />
            <path d={routes[1]} />
          </g>

          {active && (
            <g className="network-map__packets">
              {[0, 1, 3, 4].map((index) => (
                <circle key={index} r="2" fill="#c3ffdb">
                  <animateMotion
                    dur={`${7 + index * 2}s`}
                    begin={`${index * -2}s`}
                    repeatCount="indefinite"
                    path={routes[index]}
                  />
                </circle>
              ))}
            </g>
          )}

          {districts.map((district, i) => (
            <g
              key={district.name}
              transform={`translate(${district.x} ${district.y})`}
              className={`network-map__node network-map__node--${i}`}
            >
              <path
                d="M0-24L36 0L0 24L-36 0Z"
                className="network-map__node-halo"
              />
              <path
                d="M0-15L23 0L0 15L-23 0Z"
                className="network-map__node-base"
              />
              <path
                d="M0-15V15M-23 0L0 15L23 0"
                className="network-map__node-fold"
              />
              {i === 0 ? (
                <g
                  className="network-map__meridian-mark"
                  transform="translate(-10 -8)"
                >
                  <path d="M0 13V0L7 7L14 0V13M7 7V17" />
                </g>
              ) : (
                <rect
                  x="-4"
                  y="-5"
                  width="8"
                  height="8"
                  rx="1"
                  className="network-map__node-core"
                  transform="rotate(45)"
                />
              )}
              <g
                transform={`translate(0 ${i === 2 ? 49 : 45})`}
                className="network-map__district-label"
              >
                <text textAnchor="middle" className="network-map__label">
                  {district.name}
                </text>
                <text
                  y="14"
                  textAnchor="middle"
                  className="network-map__sublabel"
                >
                  {i === 0
                    ? "YOU ARE HERE"
                    : i === 2 && chapter >= 3
                      ? "SIGNAL DETECTED"
                      : `SECTOR ${district.number}`}
                </text>
              </g>
            </g>
          ))}

          <g
            transform="translate(932 207)"
            className={`network-map__threat${showThreat ? " network-map__threat--detected" : ""}`}
          >
            <path
              d="M0-13L19 0L0 13L-19 0Z"
              className="network-map__threat-outline"
            />
            <path d="M0-4V2M0 5V6" className="network-map__threat-mark" />
            <text textAnchor="middle" y="40" className="network-map__label">
              UNKNOWN
            </text>
            <text textAnchor="middle" y="54" className="network-map__sublabel">
              SIGNAL ENCRYPTED
            </text>
          </g>
        </g>

        <g className="network-map__coordinates">
          <text x="39" y="32">
            41° 52′ 55.2″ N
          </text>
          <text x="960" y="32" textAnchor="end">
            MERIDIAN / INTERNAL TOPOLOGY
          </text>
          <path d="M39 49V40H48M952 40H961V49M39 376V385H48M952 385H961V376" />
          <text x="39" y="405">
            87° 37′ 40.8″ W
          </text>
          <text x="960" y="405" textAnchor="end">
            GRID 04 — {String(chapter).padStart(2, "0")}
          </text>
        </g>
      </svg>
      <div className="network-map__legend" aria-hidden="true">
        <span>
          <i className="network-map__legend-dot" /> Network online
        </span>
        <span>
          <i className="network-map__legend-line" /> Secure connection
        </span>
        <span className="network-map__legend-signal">
          <i /> Unidentified signal
        </span>
      </div>
    </div>
  );
}

export { NetworkMap };

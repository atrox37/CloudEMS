<template>
  <div class="energy-bg">
    <svg
      class="svg"
      width="1317"
      height="694"
      viewBox="0 0 1317 694"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
    >
      <g clip-path="url(#clip0_1145_2968)">
        <!-- <rect x="-227" y="-143" width="1920" height="1080" fill="url(#pattern0_1145_2968)" /> -->
        <image
          :href="tuopuBg"
          x="-227"
          y="-143"
          width="1920"
          height="1080"
          preserveAspectRatio="xMidYMid slice"
        />
        <g class="energy-flow-path" :class="flowClass(pvFlow)" filter="url(#filter0_ddi_1145_2968)">
          <path
            d="M558.096 243.184L571.662 237.136L686.482 302.137L686.482 316.637L558.096 243.184Z"
            fill="url(#paint0_linear_1145_2968)"
          />
        </g>
        <!-- <rect opacity="0.8" x="613.906" y="257.239" width="60.48" height="21.12"
                    transform="rotate(28.4666 613.906 257.239)" fill="url(#pattern1_1145_2968)" /> -->
        <foreignObject
          x="613.906"
          y="257.239"
          width="60.48"
          height="21.12"
          transform="rotate(28.4666 613.906 257.239)"
        >
          <div
            xmlns="http://www.w3.org/1999/xhtml"
            class="horizontal-loop loop1"
            :class="flowClass(pvFlow)"
            :style="flowStyle(pvFlow)"
          >
            <div class="arrow-container arrow1">
              <img :src="jiantou" />
            </div>
            <div class="arrow-container arrow2">
              <img :src="jiantou" />
            </div>
          </div>
        </foreignObject>
        <g filter="url(#filter1_f_1145_2968)">
          <circle
            cx="576.457"
            cy="242.097"
            r="21.6"
            transform="rotate(-2.32068 576.457 242.097)"
            fill="black"
          />
        </g>
        <g
          class="energy-flow-path"
          :class="flowClass(dieselFlow)"
          filter="url(#filter2_ddi_1145_2968)"
        >
          <path
            d="M849 424.235L952.5 483.5V469L862.2 418L849 424.235Z"
            fill="url(#paint1_linear_1145_2968)"
          />
        </g>
        <g
          class="energy-flow-path"
          :class="flowClass(loadFlow)"
          filter="url(#filter3_ddi_1145_2968)"
        >
          <path
            d="M737.017 401L651.2 455.243L651.2 456L651.2 470L749.5 407.5L737.017 401Z"
            fill="url(#paint2_linear_1145_2968)"
          />
        </g>
        <!-- <rect opacity="0.8" x="728.265" y="426.892" width="60.48" height="21.12"
                    transform="rotate(148.574 728.265 426.892)" fill="url(#pattern2_1145_2968)" /> -->
        <foreignObject
          x="728.265"
          y="426.892"
          width="60.48"
          height="21.12"
          transform="rotate(148.574 728.265 426.892)"
        >
          <div
            xmlns="http://www.w3.org/1999/xhtml"
            class="horizontal-loop loop1"
            :class="flowClass(loadFlow)"
            :style="flowStyle(loadFlow)"
          >
            <div class="arrow-container arrow1">
              <img :src="jiantou" />
            </div>
            <div class="arrow-container arrow2">
              <img :src="jiantou" />
            </div>
          </div>
        </foreignObject>
        <!-- <rect opacity="0.8" width="60.48" height="21.12"
                    transform="matrix(0.855439 0.517904 0.517904 -0.855439 874.314 441.92)"
                    fill="url(#pattern3_1145_2968)" /> -->
        <foreignObject
          x="878.314"
          y="420.92"
          width="60.48"
          height="21.12"
          transform="rotate(30.566 878.314 420.92)"
        >
          <div
            xmlns="http://www.w3.org/1999/xhtml"
            class="horizontal-loop loop1"
            :class="flowClass(dieselFlow)"
            :style="flowStyle(dieselFlow)"
          >
            <div class="arrow-container arrow1">
              <img :src="jiantou" />
            </div>
            <div class="arrow-container arrow2">
              <img :src="jiantou" />
            </div>
          </div>
        </foreignObject>
        <g filter="url(#filter4_f_1145_2968)">
          <circle
            cx="859.457"
            cy="425.457"
            r="21.6"
            transform="rotate(-2.32068 859.457 425.457)"
            fill="black"
          />
        </g>
        <g filter="url(#filter5_f_1145_2968)">
          <circle
            cx="733.457"
            cy="409.457"
            r="21.6"
            transform="rotate(-2.32068 733.457 409.457)"
            fill="black"
          />
        </g>
        <g class="topology-ess-state" :data-state="essState.kind">
          <rect
            x="662.499"
            y="461.5"
            :width="essState.width"
            height="29"
            rx="14.5"
            fill="#54628C"
            fill-opacity="0.72"
          />
          <rect
            x="662.499"
            y="461.5"
            :width="essState.width"
            height="29"
            rx="14.5"
            stroke="url(#paint3_linear_1145_2968)"
            fill="none"
          />
          <circle cx="676.999" cy="476" r="5" :fill="essState.dotColor" />
          <text x="689" y="480" class="topology-ess-state__label">{{ essState.label }}</text>
        </g>
        <path
          data-figma-bg-blur-radius="10"
          d="M76 91.5H195.5V171C195.5 181.77 186.77 190.5 176 190.5H56.5V111C56.5 100.23 65.2304 91.5 76 91.5Z"
          fill="#54628C"
          fill-opacity="0.5"
          stroke="url(#paint4_linear_1145_2968)"
        />
        <g class="topology-metric-card" transform="translate(76 141)">
          <text x="0" y="-12" class="topology-metric-card__title">PV</text>
          <text x="0" y="16" class="topology-metric-card__line">
            <tspan class="topology-metric-card__name">P:</tspan>
            <tspan dx="8" class="topology-metric-card__value">
              {{ metricValue(props.data.pvP) }}
            </tspan>
            <tspan dx="4" class="topology-metric-card__unit">kW</tspan>
          </text>
        </g>

        <circle
          cx="299"
          cy="174"
          r="6"
          fill="white"
          fill-opacity="0.8"
          stroke="white"
          stroke-opacity="0.2"
          stroke-width="20"
        />
        <path
          data-figma-bg-blur-radius="10"
          d="M114 347.5H233.5V427C233.5 437.77 224.77 446.5 214 446.5H94.5V367C94.5 356.23 103.23 347.5 114 347.5Z"
          fill="#54628C"
          fill-opacity="0.5"
          stroke="url(#paint6_linear_1145_2968)"
        />
        <path
          d="M196 148H278L298.5 172"
          stroke="url(#paint5_linear_1145_2968)"
          stroke-opacity="0.3"
        />
        <g class="topology-metric-card" transform="translate(114 397)">
          <text x="0" y="-12" class="topology-metric-card__title">Load</text>
          <text x="0" y="16" class="topology-metric-card__line">
            <tspan class="topology-metric-card__name">P:</tspan>
            <tspan dx="8" class="topology-metric-card__value">
              {{ metricValue(props.data.loadP) }}
            </tspan>
            <tspan dx="4" class="topology-metric-card__unit">kW</tspan>
          </text>
        </g>

        <circle
          cx="385"
          cy="431"
          r="6"
          fill="white"
          fill-opacity="0.8"
          stroke="white"
          stroke-opacity="0.2"
          stroke-width="20"
        />
        <path
          d="M234 405H364L384.5 429"
          stroke="url(#paint7_linear_1145_2968)"
          stroke-opacity="0.3"
        />
        <path
          data-figma-bg-blur-radius="10"
          d="M1126 449.5H1245.5V529C1245.5 539.77 1236.77 548.5 1226 548.5H1106.5V469C1106.5 458.23 1115.23 449.5 1126 449.5Z"
          fill="#54628C"
          fill-opacity="0.5"
          stroke="url(#paint8_linear_1145_2968)"
        />
        <g class="topology-metric-card" transform="translate(1126 499)">
          <text x="0" y="-22" class="topology-metric-card__title">Diesel</text>
          <text x="0" y="2" class="topology-metric-card__line">
            <tspan class="topology-metric-card__name">P:</tspan>
            <tspan dx="8" class="topology-metric-card__value">
              {{ metricValue(props.data.dieselP) }}
            </tspan>
            <tspan dx="4" class="topology-metric-card__unit">kW</tspan>
          </text>
          <text x="0" y="24" class="topology-metric-card__line">
            <tspan class="topology-metric-card__name">Oil:</tspan>
            <tspan dx="8" class="topology-metric-card__value">
              {{ metricValue(props.data.dieselOil) }}
            </tspan>
            <tspan dx="4" class="topology-metric-card__unit">%</tspan>
          </text>
        </g>
        <circle
          cx="987"
          cy="481"
          r="6"
          transform="rotate(180 987 481)"
          fill="white"
          fill-opacity="0.8"
          stroke="white"
          stroke-opacity="0.2"
          stroke-width="20"
        ></circle>
        <path
          d="M1106 507H1008L987.5 483"
          stroke="url(#paint9_linear_1145_2968)"
          stroke-opacity="0.3"
        ></path>
        <path
          data-figma-bg-blur-radius="10"
          d="M1029 233.5H1148.5V313C1148.5 323.77 1139.77 332.5 1129 332.5H1009.5V253C1009.5 242.23 1018.23 233.5 1029 233.5Z"
          fill="#54628C"
          fill-opacity="0.5"
          stroke="url(#paint10_linear_1145_2968)"
        />
        <g class="topology-metric-card" transform="translate(1029 283)">
          <text x="0" y="-22" class="topology-metric-card__title">ESS</text>
          <text x="0" y="2" class="topology-metric-card__line">
            <tspan class="topology-metric-card__name">P:</tspan>
            <tspan dx="8" class="topology-metric-card__value">
              {{ metricValue(props.data.essP) }}
            </tspan>
            <tspan dx="4" class="topology-metric-card__unit">kW</tspan>
          </text>
          <text x="0" y="24" class="topology-metric-card__line">
            <tspan class="topology-metric-card__name">SOC:</tspan>
            <tspan dx="8" class="topology-metric-card__value">
              {{ metricValue(props.data.essSoc) }}
            </tspan>
            <tspan dx="4" class="topology-metric-card__unit">%</tspan>
          </text>
        </g>
        <circle
          cx="6"
          cy="6"
          r="6"
          transform="matrix(-1 0 0 1 819 279)"
          fill="white"
          fill-opacity="0.8"
          stroke="white"
          stroke-opacity="0.2"
          stroke-width="20"
        ></circle>
        <path
          d="M1009 259H835L814.5 283"
          stroke="url(#paint11_linear_1145_2968)"
          stroke-opacity="0.3"
        ></path>
      </g>
      <defs>
        <!-- <pattern id="pattern0_1145_2968" patternContentUnits="objectBoundingBox" width="1" height="1">
                    <use xlink:href="#image0_1145_2968" transform="scale(0.000260417 0.000462963)" />
                </pattern> -->
        <filter
          id="filter0_ddi_1145_2968"
          x="522.096"
          y="213.136"
          width="200.386"
          height="151.5"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="12" />
          <feGaussianBlur stdDeviation="18" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1145_2968" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="12" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 1 0 0 0 0 0.992066 0 0 0 0 0.72323 0 0 0 0.5 0"
          />
          <feBlend
            mode="normal"
            in2="effect1_dropShadow_1145_2968"
            result="effect2_dropShadow_1145_2968"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect2_dropShadow_1145_2968"
            result="shape"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="6" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0" />
          <feBlend mode="normal" in2="shape" result="effect3_innerShadow_1145_2968" />
        </filter>
        <pattern
          id="pattern1_1145_2968"
          patternContentUnits="objectBoundingBox"
          width="1"
          height="1"
        >
          <use
            xlink:href="#image1_1145_2968"
            transform="matrix(0.00371496 0 0 0.0106383 -0.0108072 0)"
          />
        </pattern>
        <filter
          id="filter1_f_1145_2968"
          x="494.857"
          y="160.497"
          width="163.201"
          height="163.201"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="30" result="effect1_foregroundBlur_1145_2968" />
        </filter>
        <filter
          id="filter2_ddi_1145_2968"
          x="813"
          y="394"
          width="175.5"
          height="137.5"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="12" />
          <feGaussianBlur stdDeviation="18" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1145_2968" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="12" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 1 0 0 0 0 0.992066 0 0 0 0 0.72323 0 0 0 0.5 0"
          />
          <feBlend
            mode="normal"
            in2="effect1_dropShadow_1145_2968"
            result="effect2_dropShadow_1145_2968"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect2_dropShadow_1145_2968"
            result="shape"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="6" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0" />
          <feBlend mode="normal" in2="shape" result="effect3_innerShadow_1145_2968" />
        </filter>
        <filter
          id="filter3_ddi_1145_2968"
          x="615.2"
          y="377"
          width="170.3"
          height="141"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="12" />
          <feGaussianBlur stdDeviation="18" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1145_2968" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="12" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 1 0 0 0 0 0.992066 0 0 0 0 0.72323 0 0 0 0.5 0"
          />
          <feBlend
            mode="normal"
            in2="effect1_dropShadow_1145_2968"
            result="effect2_dropShadow_1145_2968"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect2_dropShadow_1145_2968"
            result="shape"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="6" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0" />
          <feBlend mode="normal" in2="shape" result="effect3_innerShadow_1145_2968" />
        </filter>
        <pattern
          id="pattern2_1145_2968"
          patternContentUnits="objectBoundingBox"
          width="1"
          height="1"
        >
          <use
            xlink:href="#image1_1145_2968"
            transform="matrix(0.00371496 0 0 0.0106383 -0.0108072 0)"
          />
        </pattern>
        <pattern
          id="pattern3_1145_2968"
          patternContentUnits="objectBoundingBox"
          width="1"
          height="1"
        >
          <use
            xlink:href="#image1_1145_2968"
            transform="matrix(0.00371496 0 0 0.0106383 -0.0108072 0)"
          />
        </pattern>
        <filter
          id="filter4_f_1145_2968"
          x="777.857"
          y="343.856"
          width="163.201"
          height="163.201"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="30" result="effect1_foregroundBlur_1145_2968" />
        </filter>
        <filter
          id="filter5_f_1145_2968"
          x="651.857"
          y="327.856"
          width="163.201"
          height="163.201"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="30" result="effect1_foregroundBlur_1145_2968" />
        </filter>
        <clipPath id="bgblur_1_1145_2968_clip_path" transform="translate(-651.999 -451)">
          <rect x="662.499" y="461.5" width="91" height="29" rx="14.5" />
        </clipPath>
        <clipPath id="bgblur_2_1145_2968_clip_path" transform="translate(-46 -81)">
          <path
            d="M76 91.5H195.5V171C195.5 181.77 186.77 190.5 176 190.5H56.5V111C56.5 100.23 65.2304 91.5 76 91.5Z"
          />
        </clipPath>
        <clipPath id="bgblur_3_1145_2968_clip_path" transform="translate(-84 -337)">
          <path
            d="M114 347.5H233.5V427C233.5 437.77 224.77 446.5 214 446.5H94.5V367C94.5 356.23 103.23 347.5 114 347.5Z"
          />
        </clipPath>
        <clipPath id="bgblur_4_1145_2968_clip_path" transform="translate(-1096 -439)">
          <path
            d="M1126 449.5H1245.5V529C1245.5 539.77 1236.77 548.5 1226 548.5H1106.5V469C1106.5 458.23 1115.23 449.5 1126 449.5Z"
          />
        </clipPath>
        <clipPath id="bgblur_5_1145_2968_clip_path" transform="translate(-999 -223)">
          <path
            d="M1029 233.5H1148.5V313C1148.5 323.77 1139.77 332.5 1129 332.5H1009.5V253C1009.5 242.23 1018.23 233.5 1029 233.5Z"
          />
        </clipPath>
        <linearGradient
          id="paint0_linear_1145_2968"
          x1="565.075"
          y1="237.588"
          x2="703.965"
          y2="316.028"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#FF6900" />
          <stop offset="1" stop-color="#FE9900" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_1145_2968"
          x1="849"
          y1="424.946"
          x2="977.4"
          y2="496.346"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#FE9900" />
          <stop offset="1" stop-color="#FF6900" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_1145_2968"
          x1="644"
          y1="470.6"
          x2="748.4"
          y2="401"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#FF6900" />
          <stop offset="1" stop-color="#FE9900" />
        </linearGradient>
        <linearGradient
          id="paint3_linear_1145_2968"
          x1="664.628"
          y1="461.75"
          x2="702.176"
          y2="522.045"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#94A6C5" />
          <stop offset="0.30251" stop-color="#94A6C5" stop-opacity="0" />
          <stop offset="0.718599" stop-color="#94A6C5" stop-opacity="0.344221" />
          <stop offset="0.990385" stop-color="#94A6C5" />
        </linearGradient>
        <linearGradient
          id="paint4_linear_1145_2968"
          x1="60"
          y1="93.5"
          x2="193"
          y2="191"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#94A6C5" />
          <stop offset="0.30251" stop-color="#94A6C5" stop-opacity="0" />
          <stop offset="0.718599" stop-color="#94A6C5" stop-opacity="0.344221" />
          <stop offset="0.990385" stop-color="#94A6C5" />
        </linearGradient>
        <linearGradient
          id="paint5_linear_1145_2968"
          x1="260"
          y1="143.5"
          x2="287"
          y2="175.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="white" />
          <stop offset="1" stop-color="white" stop-opacity="0" />
        </linearGradient>
        <linearGradient
          id="paint6_linear_1145_2968"
          x1="98"
          y1="349.5"
          x2="231"
          y2="447"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#94A6C5" />
          <stop offset="0.30251" stop-color="#94A6C5" stop-opacity="0" />
          <stop offset="0.718599" stop-color="#94A6C5" stop-opacity="0.344221" />
          <stop offset="0.990385" stop-color="#94A6C5" />
        </linearGradient>
        <linearGradient
          id="paint7_linear_1145_2968"
          x1="402"
          y1="403.5"
          x2="424.5"
          y2="432"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="white" />
          <stop offset="1" stop-color="white" stop-opacity="0" />
        </linearGradient>
        <linearGradient
          id="paint8_linear_1145_2968"
          x1="1110"
          y1="451.5"
          x2="1243"
          y2="549"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#94A6C5" />
          <stop offset="0.30251" stop-color="#94A6C5" stop-opacity="0" />
          <stop offset="0.718599" stop-color="#94A6C5" stop-opacity="0.344221" />
          <stop offset="0.990385" stop-color="#94A6C5" />
        </linearGradient>
        <linearGradient
          id="paint9_linear_1145_2968"
          x1="1020.5"
          y1="509"
          x2="988"
          y2="480.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="white" />
          <stop offset="1" stop-color="white" stop-opacity="0" />
        </linearGradient>
        <linearGradient
          id="paint10_linear_1145_2968"
          x1="1013"
          y1="235.5"
          x2="1146"
          y2="333"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#94A6C5" />
          <stop offset="0.30251" stop-color="#94A6C5" stop-opacity="0" />
          <stop offset="0.718599" stop-color="#94A6C5" stop-opacity="0.344221" />
          <stop offset="0.990385" stop-color="#94A6C5" />
        </linearGradient>
        <linearGradient
          id="paint11_linear_1145_2968"
          x1="848.5"
          y1="249"
          x2="815.5"
          y2="287.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="white" />
          <stop offset="1" stop-color="white" stop-opacity="0" />
        </linearGradient>
        <clipPath id="clip0_1145_2968">
          <rect width="1317" height="694" fill="white" />
        </clipPath>
      </defs>
    </svg>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, type CSSProperties } from 'vue'
import jiantou from '@/assets/images/jiantou.png'
import tuopuBg from '@/assets/images/tuopu-bg.png'
import type { StationOverview } from '@/types/Stations'

type FlowKind = 'forward' | 'reverse' | 'idle' | 'unknown'
interface EnergyFlowState {
  kind: FlowKind
  duration: string
  delay: string
}

const props = defineProps<{ data: StationOverview; updatedAt?: number | null }>()

const now = ref(Date.now())
let clock: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  clock = setInterval(() => {
    now.value = Date.now()
  }, 1000)
})
onUnmounted(() => {
  if (clock) clearInterval(clock)
})

const isFresh = computed(() => props.updatedAt != null && now.value - props.updatedAt <= 30_000)

const metricValue = (value: number | null) => {
  if (!isFresh.value || value === null || !Number.isFinite(value)) return '-'
  return String(value)
}

const flowTiming = (power: number) => {
  const magnitude = Math.abs(power)
  if (magnitude >= 50) return { duration: '1.6s', delay: '-0.8s' }
  if (magnitude >= 5) return { duration: '2.4s', delay: '-1.2s' }
  return { duration: '3.2s', delay: '-1.6s' }
}

const createFlow = (power: number | null, positiveDirection: 'forward' | 'reverse') => {
  if (!isFresh.value || power === null || !Number.isFinite(power)) {
    return { kind: 'unknown', duration: '2.4s', delay: '-1.2s' } satisfies EnergyFlowState
  }
  if (Math.abs(power) <= 0.1) {
    return { kind: 'idle', duration: '2.4s', delay: '-1.2s' } satisfies EnergyFlowState
  }
  const forward = power > 0 ? positiveDirection === 'forward' : positiveDirection === 'reverse'
  return {
    kind: forward ? 'forward' : 'reverse',
    ...flowTiming(power),
  } satisfies EnergyFlowState
}

const pvFlow = computed(() => createFlow(props.data.pvP, 'forward'))
const loadFlow = computed(() => createFlow(props.data.loadP, 'forward'))
const dieselFlow = computed(() => createFlow(props.data.dieselP, 'reverse'))
const flowClass = (flow: EnergyFlowState) => `is-${flow.kind}`
const flowStyle = (flow: EnergyFlowState) =>
  ({ '--flow-duration': flow.duration, '--flow-delay': flow.delay }) as CSSProperties

const essState = computed(() => {
  const power = props.data.essP
  if (!isFresh.value || power === null || !Number.isFinite(power)) {
    return { kind: 'unknown', label: 'Unknown', width: 100, dotColor: '#94a6c5' }
  }
  if (Math.abs(power) <= 0.1) {
    return { kind: 'idle', label: 'Idle', width: 78, dotColor: '#facc15' }
  }
  if (power > 0) {
    return { kind: 'discharging', label: 'Discharging', width: 116, dotColor: '#4ade80' }
  }
  return { kind: 'charging', label: 'Charging', width: 100, dotColor: '#60a5fa' }
})
</script>
<style lang="scss" scoped>
.energy-bg {
  width: 100%;
  height: 100%;

  .svg {
    width: 100%;
    height: 100%;
    display: block;
    overflow: hidden;
  }
}

.topology-metric-card__title,
.topology-metric-card__line {
  font-family: Arial, Helvetica, sans-serif;
  text-anchor: start;
}

.topology-metric-card__title {
  font-weight: 700;
  font-size: 18px;
  fill: #ffffff;
  dominant-baseline: middle;
}

.topology-metric-card__line {
  dominant-baseline: middle;
}

.topology-metric-card__name {
  font-weight: 400;
  font-size: 16px;
  fill: #ffffff;
}

.topology-metric-card__value {
  font-weight: 700;
  font-size: 16px;
  fill: #ffffff;
}

.topology-metric-card__unit {
  font-weight: 400;
  font-size: 12px;
  fill: rgba(255, 255, 255, 0.5);
}

.topology-ess-state__label {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 12px;
  fill: #ffffff;
}

.horizontal-loop {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  padding: 0;
  background: transparent;

  clip-path: polygon(0% 0%, calc(100% - 7px) 0%, 100% 50%, calc(100% - 7px) 100%, 0% 100%, 7px 50%);
  z-index: 999;

  &.is-idle,
  &.is-unknown {
    .arrow-container {
      animation: none;
      opacity: 0;
    }
  }

  &.is-unknown {
    opacity: 0.35;
    filter: grayscale(1);
  }

  &.is-reverse .arrow-container {
    animation-name: moveLeft;
  }
}

.energy-flow-path {
  opacity: 1;
  transition: opacity 240ms ease;

  &.is-idle {
    opacity: 0.45;
  }

  &.is-unknown {
    opacity: 0.25;
  }
}

// .horizontal-loop.loop1 {
//     transform-origin: 489.714px 524.347px;
// }

// .horizontal-loop.loop2 {
//     transform-origin: 809.812px 571.209px;
// }

// .horizontal-loop.loop3 {
//     transform-origin: 1109.4px 606.91px;
// }

.horizontal-loop::before {
  content: '';
  position: absolute;
  left: -7px;
  top: 0;
  width: 7px;
  height: 100%;
  background: transparent;
  // clip-path: polygon(0% 0%, 100% 30%, 0% 100%);
  z-index: 1;
}

.horizontal-loop::after {
  content: '';
  position: absolute;
  right: -7px;
  top: 0;
  width: 7px;
  height: 100%;
  background: #1a1a1a;
  // clip-path: polygon(0% 50%, 100% 0%, 100% 100%);
  z-index: 10;
}

.arrow-container {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 100%;
  height: 100%;
}

.arrow-container img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* 创建多个箭头实现无缝效果 - 紧密排列 */
.arrow1 {
  animation: moveRight var(--flow-duration, 2.4s) linear infinite;
}

.arrow2 {
  animation: moveRight var(--flow-duration, 2.4s) linear infinite;
  animation-delay: var(--flow-delay, -1.2s);
}

@keyframes moveRight {
  0% {
    left: -60.48px;
  }

  100% {
    left: 60.48px;
  }
}

@keyframes moveLeft {
  0% {
    left: 60.48px;
  }

  100% {
    left: -60.48px;
  }
}

/* px-to-rem-enable */
</style>

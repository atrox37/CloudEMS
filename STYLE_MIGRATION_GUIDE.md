# VoltageEMS Style Migration Guide

This document summarizes the current style architecture in `D:\RushRush\VoltageEMS\apps` and focuses on the visual/formal conventions you can reuse in another project.

## 1. Style System Overview

The project uses a layered style system instead of mixing all overrides into page components.

Global entry:

- `src/assets/main.css`

Import order:

1. `src/assets/styles/tokens.css`
2. `src/assets/styles/element/css-vars.css`
3. `src/assets/styles/base.css`
4. `src/assets/styles/fonts/index.scss`
5. `src/assets/styles/element/index.scss`
6. `src/assets/styles/vueflow.scss`
7. `src/assets/styles/device-monitoring-scroller.scss`

This order matters:

- project tokens are defined first
- Element Plus variables are mapped second
- document-level base styles come next
- fonts are loaded before component skins
- structural Element Plus overrides are applied after the library CSS
- feature-specific third-party styles come last

The project already documents this layering in:

- `src/assets/styles/README.md`

## 2. Theme Character

The visual language is a dark industrial control-panel theme.

Core characteristics:

- dark canvas with blue-gray surfaces
- bright orange primary action color
- translucent panels and inputs
- mostly square corners
- small rem-based typography
- thin borders with low-opacity cool-gray tones
- restrained shadows
- strong dependence on overlays, blur, and semi-transparent backgrounds

The visual center of gravity is:

- `body`: `#17233d`
- panel/page surface: `#212c49`
- primary accent: `#ff6900`
- text primary: `#ffffff`
- text regular: `#d7deed`
- border: `rgba(148, 166, 197, 0.3)`

## 3. Design Tokens

Main file:

- `src/assets/styles/tokens.css`

Tokens are defined under `:root` and grouped by purpose.

### 3.1 Brand tokens

- `--vt-color-primary: #ff6900`
- `--vt-color-primary-hover: #ff8733`
- `--vt-color-primary-active: #e55f00`
- `--vt-color-success: #52c41a`
- `--vt-color-warning: #faad14`
- `--vt-color-danger: #ff4d4f`
- `--vt-color-info: #8c8c8c`

### 3.2 Text tokens

- `--vt-text-primary: #ffffff`
- `--vt-text-regular: #d7deed`
- `--vt-text-secondary: #a6b6d2`
- `--vt-text-placeholder: #a8abb2`
- `--vt-text-disabled: red`

Notes:

- `--vt-text-disabled` is currently `red`, which looks like a temporary/debug value rather than a final design token.
- placeholder text is not red in the current project; disabled text is.

### 3.3 Surface tokens

- `--vt-bg-body: #17233d`
- `--vt-bg-page: #212c49`
- `--vt-bg-panel: rgba(33, 44, 73, 0.92)`
- `--vt-bg-overlay: rgba(10, 18, 33, 0.72)`
- `--vt-bg-elevated: rgba(58, 82, 121, 0.32)`
- `--vt-bg-input: rgba(84, 98, 140, 0.2)`
- `--vt-bg-muted: rgba(255, 255, 255, 0.08)`

### 3.4 Shape and shadow tokens

- corners are mostly square:
  `--vt-radius-none: 0rem`
- small utility radius:
  `--vt-radius-sm: 0.04rem`
- dialog/popover style shadow is soft and dark:
  `--vt-shadow-dialog: 0 0.04rem 0.12rem rgba(0, 0, 0, 0.35)`

### 3.5 Typography tokens

- font family: `Arimo, sans-serif`
- size scale:
  `0.12rem / 0.13rem / 0.14rem / 0.16rem / 0.18rem / 0.2rem`

### 3.6 Size tokens

- control heights:
  `0.28rem / 0.32rem / 0.4rem`
- field width:
  `--vt-field-width: 2.4rem`
- select width:
  `--vt-select-width: 2.4rem`
- toast layer:
  `--vt-z-toast: 3000`

## 4. Typography and Base Layer

Files:

- `src/assets/styles/base.css`
- `src/assets/styles/fonts/index.scss`

Base layer responsibilities:

- sets root font-size to `100px`
- stretches `html`, `body`, `#app` to full viewport
- sets body background/text/font defaults
- disables page scroll with `overflow: hidden`
- normalizes heading and paragraph margins
- defines thin custom scrollbars
- adds a custom overlay bubble style for node variable popups

Fonts:

- `Arimo` is the actual base UI font
- `Montserrat` is also loaded and available
- both are local variable WOFF2 font files

## 5. Responsive Mechanism

Files:

- `src/utils/responsive.ts`
- `src/main.ts`

Current behavior:

- `initResponsive()` is called in `src/main.ts`
- `html.style.fontSize` is recalculated on resize
- current scaling is width-only
- scale formula is `window.innerWidth / 1920`
- base conversion assumes `100px = 1rem`

This means the whole UI is designed as a rem-scaled 1920-wide dashboard.

Important migration implication:

- all rem values in tokens and component skins assume this width-based root scaling model
- if the target project uses normal browser `16px` root sizing, the visual proportions will be completely different

## 6. Element Plus Theming Strategy

There are two layers for Element Plus.

### 6.1 Variable mapping layer

File:

- `src/assets/styles/element/css-vars.css`

Purpose:

- map project-level `--vt-*` tokens into `--el-*` variables
- change this file first if the goal is global Element Plus recoloring

Examples:

- `--el-color-primary -> --vt-color-primary`
- `--el-text-color-placeholder -> --vt-text-placeholder`
- `--el-input-bg-color -> --vt-bg-input`
- `--el-dialog-bg-color -> --vt-bg-panel`
- `--el-table-header-bg-color -> rgba(58, 82, 121, 0.8)`

Current notable details:

- selector is `:root:root`, which intentionally increases specificity a little
- `--el-select-input-color` is explicitly set to `var(--vt-text-placeholder)`
- `--el-input-focus-border-color` is currently the same as normal border color, not the orange primary color
- `--el-fill-color-light` is assigned twice; the later input-oriented assignment wins

### 6.2 Structural skin layer

Files:

- `src/assets/styles/element/index.scss`
- component files like `ele-button.scss`, `ele-input.scss`, `ele-select.scss`, `ele-dialog.scss`, `ele-table.scss`, `ele-message.scss`

Purpose:

- reshape Element Plus components where CSS variables alone are not enough
- define layout, spacing, radius, borders, hover effects, popper chrome, and component-specific visuals

Most overrides are scoped under:

- `.voltage-class`

Migration implication:

- pages/components that should receive the skin need a `.voltage-class` wrapper
- teleported components such as notifications are styled globally and do not depend on `.voltage-class`

## 7. Component Style Summary

### 7.1 Buttons

File:

- `src/assets/styles/element/ele-button.scss`

Formal characteristics:

- square corners
- flat look, no default Element border
- base background is translucent white overlay
- primary buttons use the orange brand color
- focus ring is orange and subtle
- disabled state reduces opacity and removes depth

### 7.2 Inputs

File:

- `src/assets/styles/element/ele-input.scss`

Formal characteristics:

- width defaults to `min(100%, var(--vt-field-width))`
- dark translucent input background
- thin solid border
- no glow, no heavy focus ring
- square corners
- placeholder text comes from token layer
- textarea follows the same visual language

### 7.3 Selects and poppers

File:

- `src/assets/styles/element/ele-select.scss`

Formal characteristics:

- width defaults to `min(100%, var(--vt-select-width))`
- square wrapper with translucent input background
- popper uses gradient border image and blur
- options use transparent background with light hover fills
- dropdown arrows are mostly hidden or minimized
- empty and loading states use subdued secondary text

This is one of the most customized Element Plus components in the project.

### 7.4 Forms

File:

- `src/assets/styles/element/ele-form.scss`

Formal characteristics:

- labels use the same base font and height as controls
- form content area keeps a minimum field width
- validation errors appear directly under the field in danger color
- error state changes field border, not label color
- inline forms keep large horizontal spacing

### 7.5 Menus

File:

- `src/assets/styles/element/ele-menu.scss`

Formal characteristics:

- sidebar-driven skin with image-based hover and selected backgrounds
- white text by default
- submenu arrows are hidden
- collapsed state uses a separate set of background assets
- popup menus use translucent backgrounds, gradient borders, and a custom arrow wedge

This part is visually tied to project image assets:

- `@/assets/images/sidebar-tag-hover.png`
- `@/assets/images/sidebar-tag-selected.png`
- `@/assets/images/sidebar-collapseTag-hover.png`
- `@/assets/images/sidebar-collapseTag-selected.png`

### 7.6 Dialogs

File:

- `src/assets/styles/element/ele-dialog.scss`

Formal characteristics:

- centered overlay dialog
- dark blue panel with translucent/blurred feel
- gradient border-image instead of plain border
- square corners
- white title text
- large close button area
- custom scrollbar styling inside body
- fullscreen dialog reuses the same language

### 7.7 Tables and pagination

File:

- `src/assets/styles/element/ele-table.scss`

Formal characteristics:

- transparent table body
- header uses cool translucent blue strip
- low-opacity white borders
- fixed right columns use darker solid background
- row hover deepens to dark blue
- cell content is line-clamped with ellipsis
- pagination keeps the same dark flat language

## 8. Alarm Notification Implementation

Implementation is split across logic and style.

Logic file:

- `src/App.vue`

Styles file:

- `src/assets/styles/element/ele-message.scss`

### 8.1 Trigger mechanism

Alarm notifications are driven by the global WebSocket listener configured in `src/App.vue`.

Behavior:

- when `alarm.status == 1`, the app opens an `ElNotification` error notification
- when the alarm recovers, the app opens an `ElNotification.success` notification
- active alarm notifications are stored in `alarmMap`
- each active notification is keyed by `alarm.alarm_id`
- if a recovery arrives, the old active notification is closed and removed

### 8.2 Error notification structure

Error notification settings:

- `title: 'Alarm'`
- `type: 'error'`
- `customClass: 'alarm-notification alarm-notification--error'`
- `showClose: true`
- `dangerouslyUseHTMLString: true`
- `duration: 0`

Rendered HTML structure:

```html
<div class="alarm-notification-content">
  <span class="alarm-notification-msg">...</span>
  <div class="alarm-notification-footer">
    <button class="alarm-detail-btn">to detail</button>
  </div>
</div>
```

Behavior:

- the notification never auto-closes
- the detail button closes all notifications and routes to `alarmCurrentRecords`
- click listeners are attached after `nextTick()`
- listeners are manually cleaned up in `onClose`

### 8.3 Recovery notification structure

Recovery notification settings:

- `title: 'Alarm Recovered'`
- `customClass: 'alarm-notification alarm-notification--success'`
- `duration: 3000`

Behavior:

- auto-closes after 3 seconds
- also closes the matching persistent error notification if one exists

### 8.4 Notification visual design

Base notification skin:

- selector: `.alarm-notification.el-notification`
- width: `3.6rem`
- padding: `0.14rem 0.16rem 0.12rem`
- border width: `0.01rem`
- radius: `0.04rem`
- shadow: `var(--vt-shadow-dialog)`

Typography:

- title: `0.15rem`, bold, line-height `1.4`
- body: `0.13rem`, line-height `1.5`
- close icon: `0.15rem`
- leading icon: `0.24rem`

Layout:

- notification content uses a vertical flex layout
- message and footer are separated by `0.08rem`
- footer is right-aligned
- action button is on its own row

### 8.5 Error-state visual language

Selector:

- `.alarm-notification--error.el-notification`

Visual description:

- deep red background: `#3c1212`
- bright red border: `#e53935`
- pink-red title/icon: `#ff8a80`
- pale red content text: `#ffcdd2`
- red CTA button with lighter hover and darker active states

This is intentionally high-contrast and urgent.

### 8.6 Success-state visual language

Selector:

- `.alarm-notification--success.el-notification`

Visual description:

- deep green background: `#0d2e14`
- bright green border: `#43a047`
- light green title/icon: `#a5d6a7`
- pale green content text: `#c8e6c9`

This is clearly differentiated from the active alarm state but still consistent with the dark theme.

### 8.7 Button design inside alarm notifications

Selector:

- `.alarm-detail-btn`

Formal characteristics:

- compact right-aligned action button
- uses project primary orange by default
- no border
- tiny radius `0.02rem`
- text color is white
- hover/active use primary hover/active tokens

Exception:

- inside active error notifications, the button is overridden to red so it visually belongs to the alarm state

### 8.8 Notification-related Element message styles

Same file also customizes `ElMessage` and `ElMessageBox`.

`ElMessage`:

- top offset `1rem`
- dark floating container
- thin border and low-depth shadow
- error messages recolor content to `#f56c6c`

`ElMessageBox`:

- dark dialog-like panel
- white title and body text
- compact padding
- no heavy default Element Plus chrome

## 9. Migration Checklist

To reproduce this style system in another project, copy or rebuild these layers in order.

1. Copy the width-based responsive root font-size model from `src/utils/responsive.ts`.
2. Copy `src/assets/main.css` import order exactly.
3. Copy `tokens.css` first and decide whether to keep or fix `--vt-text-disabled: red`.
4. Copy `element/css-vars.css` to remap tokens into Element Plus variables.
5. Copy `theme-vars.scss` if the target project will keep the SCSS-based component skins.
6. Copy `element/index.scss` and the component SCSS files you actually need.
7. Ensure pages/components that should inherit the Element skins are wrapped in `.voltage-class`.
8. Copy local fonts or replace `Arimo`/`Montserrat` with fonts available in the target project.
9. Copy sidebar image assets if you want the same menu visuals.
10. Copy the alarm-notification logic from `src/App.vue` if the target project also has live WebSocket alarm events.
11. Copy the alarm notification CSS from `ele-message.scss`; note that it is global and works with teleported Element notifications.

## 10. Migration Risks and Notes

### 10.1 Things that are project-specific

- `.voltage-class` scoping model
- sidebar background images
- WebSocket-driven alarm lifecycle
- route target `alarmCurrentRecords`
- Vue Flow and device-monitoring custom feature styles

### 10.2 Things to verify before reuse

- whether the target project also wants width-only rem responsiveness
- whether square corners are desired everywhere
- whether disabled text should remain red
- whether `--el-select-input-color` should stay placeholder-colored
- whether the target project needs the same `dangerouslyUseHTMLString` notification pattern

### 10.3 Practical recommendation

If you are migrating to a new project, preserve the current architecture rather than copying single component files ad hoc:

1. tokens
2. Element variable mapping
3. base layer
4. Element structural skin layer
5. feature-specific local styles

That is the cleanest way to keep the same visual language and avoid override drift.

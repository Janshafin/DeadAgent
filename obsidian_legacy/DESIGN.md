---
name: Obsidian Legacy
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1b1c1c'
  surface-container: '#1f2020'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353535'
  on-surface: '#e4e2e1'
  on-surface-variant: '#d0c5b2'
  inverse-surface: '#e4e2e1'
  inverse-on-surface: '#303030'
  outline: '#99907e'
  outline-variant: '#4d4637'
  surface-tint: '#e6c364'
  primary: '#e6c364'
  on-primary: '#3d2e00'
  primary-container: '#c9a84c'
  on-primary-container: '#503d00'
  inverse-primary: '#755b00'
  secondary: '#e1c379'
  on-secondary: '#3e2e00'
  secondary-container: '#5b4606'
  on-secondary-container: '#d2b56d'
  tertiary: '#b9c4ff'
  on-tertiary: '#1e2b66'
  tertiary-container: '#9ba8eb'
  on-tertiary-container: '#2e3b77'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffe08f'
  primary-fixed-dim: '#e6c364'
  on-primary-fixed: '#241a00'
  on-primary-fixed-variant: '#584400'
  secondary-fixed: '#ffdf93'
  secondary-fixed-dim: '#e1c379'
  on-secondary-fixed: '#241a00'
  on-secondary-fixed-variant: '#584404'
  tertiary-fixed: '#dde1ff'
  tertiary-fixed-dim: '#b9c3ff'
  on-tertiary-fixed: '#041451'
  on-tertiary-fixed-variant: '#35437e'
  background: '#131313'
  on-background: '#e4e2e1'
  surface-variant: '#353535'
typography:
  display-lg:
    fontFamily: Cormorant Garamond
    fontSize: 64px
    fontWeight: '300'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Cormorant Garamond
    fontSize: 32px
    fontWeight: '400'
    lineHeight: '1.2'
  title-sm:
    fontFamily: Josefin Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.5'
    letterSpacing: 0.15em
  body-reg:
    fontFamily: Josefin Sans
    fontSize: 16px
    fontWeight: '300'
    lineHeight: '1.6'
    letterSpacing: 0.01em
  label-caps:
    fontFamily: Josefin Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.2em
spacing:
  unit: 4px
  container-max: 1200px
  gutter: 24px
  margin-lg: 64px
  section-gap: 128px
---

## Brand & Style

The design system is anchored in the visual language of ultra-luxury private banking and heritage estate management. It evokes an emotional response of absolute security, permanence, and "quiet luxury"—where wealth is signaled through restraint rather than excess. 

The style is a synthesis of **Minimalism** and **High-Contrast Modernism**. By utilizing a near-black foundation and razor-thin gold accents, the interface feels less like a typical software application and more like a digital vault. Every element is intentional, prioritizing high-trust interactions for the management of sensitive blockchain assets. The aesthetic avoids trends in favor of a timeless, architectural rigidity that suggests the protocol is built to last for generations.

## Colors

The palette is restricted to preserve the "Old Money" narrative. The primary background is a deep, singular obsidian (#0A0A0B), which should be paired with a subtle 2% opacity monochromatic noise overlay to prevent "flatness" and simulate physical material. 

Gold is used sparingly as a functional accent. The primary gold (#C9A84C) serves as the default state for critical actions and borders, while the lighter highlight gold (#E2C47A) is reserved strictly for hover states and active indicators. Interaction feedback is communicated through luminance shifts rather than hue changes to maintain a sophisticated, monochromatic atmosphere.

## Typography

This design system utilizes a high-contrast typographic pairing to balance tradition with modernity. 

**Cormorant Garamond** is the voice of authority. It is used for large displays and headings. Its elegant serifs should be set with generous leading and occasional italicization for emphasis, suggesting a signed legal document or a ledger.

**Josefin Sans** provides the functional interface layer. It must be used for all UI labels, body copy, and data points. To reinforce the luxury banking aesthetic, all labels should be set in uppercase with increased letter spacing (tracking), ensuring maximum legibility and a clean, technical feel that balances the decorative nature of the serif headlines.

## Layout & Spacing

The layout philosophy centers on a **Fixed Grid** model, favoring wide margins and significant vertical "air" to create a sense of exclusivity. A 12-column grid is utilized, but content is often centered within a narrow 8-column span to increase focus.

Spacing is governed by a strict 4px baseline, but the "rhythm" is intentionally slow. Large gaps between sections (up to 128px) are encouraged to separate distinct protocol functions. Elements should never feel crowded; the abundance of empty obsidian space is a key indicator of the system's luxury status.

## Elevation & Depth

In this design system, depth is not achieved through shadows, but through **Tonal Layering** and **Low-Contrast Outlines**. 

The UI remains intentionally flat to the eye, mimicking a sheet of polished stone. Surfaces that need to appear "above" the background are defined by a slightly lighter fill (#141415) and a 1px gold border set at 30% opacity. This creates a "wireframe" depth that feels architectural. Interactivity is signaled by increasing the opacity of these gold borders or adding a faint gold outer glow (max 4px blur) to simulate the illumination of a fine metal edge.

## Shapes

The shape language is strictly geometric and architectural. A **2px radius** is applied to all rectangular elements—this is just enough to soften the "digital" harshness of a true 0px corner while maintaining a sharp, precision-machined appearance. 

Rounded "pill" buttons or large circular elements are strictly forbidden. All containers, buttons, and input fields must be rectangular. This structural rigidity reinforces the protocol’s identity as a secure, unchanging legal instrument.

## Components

### Buttons
Primary buttons are rectangular with a 2px radius. They feature a 1px gold border (#C9A84C) and centered Josefin Sans text in spaced caps. The fill should remain transparent or match the background, only becoming solid gold (#C9A84C) on hover with dark text to signal a "heavy" interaction.

### Input Fields
Fields are defined by a single 1px gold bottom border at 30% opacity. When focused, the border opacity increases to 100%. Labels sit above the field in 10px Josefin Sans caps.

### Cards & Containers
Cards are used to house asset data. They feature the obsidian fill (#141415) and a 1px gold border at 20% opacity. The noise texture should be slightly more visible on cards than on the base background.

### Lists & Data Tables
Blockchain data is presented in clean rows separated by 1px horizontal gold lines at 10% opacity. Headers must be Josefin Sans caps. Values should be perfectly aligned to the grid to suggest a meticulous ledger.

### Status Indicators
Status states (Active, Pending, Expired) should not use "traffic light" colors (red/green). Instead, use varying weights of gold or tonal grays to maintain the monochrome luxury aesthetic. Use a small 4px square instead of a circle for status dots.
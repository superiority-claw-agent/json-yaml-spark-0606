# UX Specification -- json-yaml-spark-0606

## UX Principles

- Keep the primary task visible: paste, validate, convert, copy.
- Make failure states easier to recover from than to misunderstand.
- Preserve a sense of control through explicit labels, stable preferences, and immediate feedback.
- Optimize layout by context: side-by-side on desktop, stacked and scroll-friendly on mobile.

## User Flows

### Convert a Valid Document

```mermaid
flowchart TD
    A[Open app] --> B[Choose conversion direction]
    B --> C[Paste input or load example]
    C --> D{Input valid?}
    D -->|Yes| E[Press Convert]
    E --> F[Formatted output appears]
    F --> G[Copy output]
    D -->|No| H[See error guidance]
    H --> C
```

### Recover From Invalid Input

```mermaid
flowchart TD
    A[Edit source] --> B[Validation state updates]
    B --> C{Parse succeeds?}
    C -->|No| D[Show line/column and hint]
    D --> E[User fixes source]
    E --> B
    C -->|Yes| F[Enable confident conversion]
```

### Mobile Utility Flow

```mermaid
flowchart TD
    A[Open app on phone] --> B[Stacked workspace loads]
    B --> C[Paste text into source area]
    C --> D[Validation summary stays above fold]
    D --> E[Convert]
    E --> F[Scroll to output card]
    F --> G[Copy result]
```

## Key Screens

### Main Converter Workspace

**Purpose:** Deliver the full core job in one place: format selection, input, validation, conversion, output, examples, and copy.

**Entry points:** Root URL, refresh, or direct visit from search/bookmark.

**Requirements served:** `REQ-001`, `REQ-002`, `REQ-003`, `REQ-005`, `REQ-006`, `REQ-008`

**Key elements:**

- Direction toggle: `JSON -> YAML` or `YAML -> JSON`
- Source editor with label, placeholder, and example loader
- Validation summary area
- Indentation controls for the target format
- Convert button
- Output panel with copy action

**States:**

- **Initial:** Empty source with example shortcuts and brief instructions.
- **Valid input:** Positive validation indicator and enabled conversion.
- **Invalid input:** Error banner and disabled or guarded conversion.
- **Converted:** Output visible with copy confirmation affordance after use.

**Accessibility notes:**

- Every control must have a programmatic label.
- Validation and copy feedback should use an `aria-live` region.
- Focus order should follow the top-down task order.
- Textareas must remain keyboard-resizable where platform conventions allow.

**Performance notes:**

- The app shell should render immediately without waiting on remote data.
- Validation should feel immediate for normal snippets without freezing typing.
- Example loading should be instant because examples are local fixtures.

**Desktop wireframe:**

<div style="max-width:1040px; margin:16px 0; border:2px solid #24313d; border-radius:18px; overflow:hidden; background:#f5f1e8; color:#13212c; font-family:Georgia, 'Times New Roman', serif;">
  <div style="display:flex; justify-content:space-between; align-items:center; padding:14px 18px; background:#13212c; color:#f7f3ea;">
    <div><b>JSON ⇄ YAML Spark</b><div style="font-size:12px; opacity:0.85;">Local conversion. No server round trip.</div></div>
    <div style="font-size:13px;">Examples | Indent: 2 spaces</div>
  </div>
  <div style="padding:18px;">
    <div style="display:flex; gap:12px; margin-bottom:14px;">
      <div style="padding:8px 12px; border-radius:999px; background:#d76b39; color:#fff;"><b>JSON → YAML</b></div>
      <div style="padding:8px 12px; border-radius:999px; background:#e5dccd;">YAML → JSON</div>
      <div style="margin-left:auto; padding:8px 12px; border-radius:10px; background:#d9ead3;">Valid input</div>
    </div>
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
      <div style="border:2px solid #cbbca7; border-radius:14px; background:#fbf8f2; padding:14px;">
        <div style="display:flex; justify-content:space-between; margin-bottom:10px;"><b>Source</b><span>Load example</span></div>
        <div style="height:220px; border:1px solid #cbbca7; border-radius:10px; background:#fff; padding:12px; white-space:pre-wrap;">{ "service": "api", "enabled": true }</div>
        <div style="margin-top:10px; font-size:13px; color:#475866;">Paste JSON or YAML here.</div>
      </div>
      <div style="border:2px solid #cbbca7; border-radius:14px; background:#fbf8f2; padding:14px;">
        <div style="display:flex; justify-content:space-between; margin-bottom:10px;"><b>Output</b><span style="background:#13212c; color:#fff; padding:6px 10px; border-radius:999px;">Copy</span></div>
        <div style="height:220px; border:1px solid #cbbca7; border-radius:10px; background:#fff; padding:12px; white-space:pre-wrap;">service: api
enabled: true</div>
        <div style="margin-top:10px; font-size:13px; color:#475866;">YAML formatted with current indentation settings.</div>
      </div>
    </div>
    <div style="margin-top:14px; border:1px dashed #b95c33; border-radius:12px; padding:12px; background:#fff6f1;">
      Error area stays hidden when valid. On failure it shows line, column, and a human-readable hint.
    </div>
  </div>
</div>

**Mobile wireframe (375px+):**

<div style="max-width:380px; margin:16px 0; border:2px solid #24313d; border-radius:28px; overflow:hidden; background:#f5f1e8; color:#13212c; font-family:Georgia, 'Times New Roman', serif;">
  <div style="padding:12px 14px; background:#13212c; color:#f7f3ea;">
    <b>JSON ⇄ YAML Spark</b>
    <div style="font-size:12px; opacity:0.85;">Fast local converter</div>
  </div>
  <div style="padding:14px; display:grid; gap:10px;">
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
      <div style="padding:8px; border-radius:999px; background:#d76b39; color:#fff; text-align:center;"><b>JSON → YAML</b></div>
      <div style="padding:8px; border-radius:999px; background:#e5dccd; text-align:center;">YAML → JSON</div>
    </div>
    <div style="padding:10px; border-radius:12px; background:#d9ead3;">Valid input</div>
    <div style="border:2px solid #cbbca7; border-radius:14px; background:#fbf8f2; padding:12px;">
      <b>Source</b>
      <div style="margin-top:8px; height:150px; border:1px solid #cbbca7; border-radius:10px; background:#fff; padding:10px;">Paste here...</div>
      <div style="margin-top:8px;">Examples</div>
    </div>
    <div style="display:grid; grid-template-columns:1fr auto; gap:8px;">
      <div style="padding:12px; border-radius:12px; background:#13212c; color:#fff; text-align:center;"><b>Convert</b></div>
      <div style="padding:12px; border-radius:12px; background:#e5dccd;">2 spaces</div>
    </div>
    <div style="border:2px solid #cbbca7; border-radius:14px; background:#fbf8f2; padding:12px;">
      <div style="display:flex; justify-content:space-between;"><b>Output</b><span>Copy</span></div>
      <div style="margin-top:8px; height:120px; border:1px solid #cbbca7; border-radius:10px; background:#fff; padding:10px;"></div>
    </div>
  </div>
</div>

### Error Guidance Panel

**Purpose:** Turn parser failures into actionable fixes without forcing the user to decode raw parser terminology.

**Entry points:** Appears inline within the main workspace when validation or conversion fails.

**Requirements served:** `REQ-003`, `REQ-004`, `REQ-008`

**Key elements:**

- Error severity heading
- Line and column metadata when available
- Plain-language explanation
- Optional raw parser detail for advanced users
- Retry guidance or example fallback action

**States:**

- **Hidden:** No error exists.
- **Validation error:** Source cannot be parsed in current source format.
- **Clipboard failure:** Secondary inline message after unsuccessful copy attempt.

**Accessibility notes:**

- Error summary should be announced through a polite live region.
- Color cannot be the only indicator; use iconography or labels plus text.
- Raw error details should be expandable but still keyboard reachable.

**Performance notes:**

- Error rendering must not block further typing.
- Showing the panel should not reflow the whole page unpredictably on mobile; reserve space or anchor it near the source editor.

**Desktop wireframe:**

<div style="max-width:860px; margin:16px 0; border:2px solid #b95c33; border-radius:16px; background:#fff6f1; color:#4a2013; font-family:Georgia, 'Times New Roman', serif; padding:16px;">
  <div style="display:flex; justify-content:space-between; align-items:center;">
    <b>Input could not be parsed</b>
    <span>Line 4, Column 9</span>
  </div>
  <div style="margin-top:10px;">Expected a `:` after the key name. Check the indentation and key/value separator near line 4.</div>
  <div style="margin-top:10px; padding:10px; border:1px dashed #b95c33; border-radius:10px;">Raw parser message: Implicit map keys need to be followed by map values.</div>
  <div style="margin-top:10px;">Suggested next step: fix the highlighted line or load an example to compare the expected shape.</div>
</div>

**Mobile wireframe (375px+):**

<div style="max-width:380px; margin:16px 0; border:2px solid #b95c33; border-radius:16px; background:#fff6f1; color:#4a2013; font-family:Georgia, 'Times New Roman', serif; padding:12px;">
  <b>Parse error</b>
  <div style="margin-top:6px;">Line 4, Column 9</div>
  <div style="margin-top:8px;">Check the missing `:` near the current line.</div>
  <div style="margin-top:8px; padding:8px; border:1px dashed #b95c33; border-radius:10px;">Show raw details</div>
</div>

### Examples Drawer / Example Picker

**Purpose:** Provide safe starter content and recovery paths for users who need a working sample immediately.

**Entry points:** Main workspace example button or empty-state prompt.

**Requirements served:** `REQ-007`, `REQ-008`

**Key elements:**

- Example cards with title and format badge
- Replace confirmation text
- One-tap load action

**States:**

- **Collapsed:** Hidden behind an Examples button to keep the main task uncluttered.
- **Open:** Shows curated local sample snippets.
- **Replacing content:** Warns that loading an example will overwrite current source text.

**Accessibility notes:**

- If implemented as a drawer or modal, focus must move into it and return correctly on close.
- Example names should describe the sample content, not just its format.

**Performance notes:**

- Examples are static and bundled locally; the picker should open instantly.

## Content and Microcopy

- Primary CTA: `Convert`
- Copy action: `Copy output`
- Success feedback: `Copied to clipboard`
- Valid state: `Input is valid`
- Invalid state headline: `Input could not be parsed`
- Empty state helper: `Paste JSON or YAML, or load an example to start`

## Responsive Behavior

- `>= 1024px`: side-by-side source and output panes, controls in a single top action row
- `768px - 1023px`: two-column layout may remain, but controls can wrap to a second row
- `375px - 767px`: stacked cards, sticky primary action area if needed, no hover-only affordances

## Interaction Notes

- Validation can occur as the user edits, but conversion remains an explicit action to preserve a sense of control.
- Changing direction swaps labels, placeholders, validation messaging context, and target indentation controls.
- Copy is only enabled when output exists.
- Loading an example should visibly replace the current source text and immediately update validation state.

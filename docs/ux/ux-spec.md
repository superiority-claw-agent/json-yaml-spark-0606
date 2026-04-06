# UX Specification -- json-yaml-spark-0606

## User Flows

### {Flow 1}

```mermaid
flowchart TD
    A[Landing Page] --> B{Authenticated?}
    B -->|No| C[Login/Register]
    B -->|Yes| D[Dashboard]
    C --> D
```

## Key Screens

### {Screen 1}

**Purpose:** {What this screen does and why it exists}
**Entry points:** {How users get here}
**Key elements:**
- {Element 1}
- {Element 2}
- {Element 3}

**States:**
- **Loading:** {what shows}
- **Empty:** {what shows}
- **Error:** {what shows}
- **Populated:** {what shows}

**Accessibility notes:**
- {Keyboard behavior}
- {Screen reader expectations}
- {Color/contrast considerations}

**Performance notes:**
- {Expected payload / render behavior}
- {How this screen should behave on slower devices or 3G}

**Wireframe:**

<div style="max-width:800px; margin:16px 0; border:3px solid #333; border-radius:12px; padding:0; background:#f5f5f0; font-family:'Comic Sans MS','Segoe Print',cursive; box-shadow:0 4px 12px rgba(0,0,0,0.1); overflow:hidden">
  <div style="background:#444; color:#eee; padding:10px 16px; display:flex; justify-content:space-between; align-items:center; border-bottom:2px dashed #666">
    <b>{App Name}</b>
    <span>Menu</span>
  </div>
  <div style="padding:16px">
    <div style="font-size:20px; font-weight:bold; border-bottom:2px dashed #bbb; padding-bottom:8px; margin-bottom:12px">{Page Title}</div>
    <div style="border:2px dashed #bbb; border-radius:6px; padding:16px; background:#fafafa">
      {Low-fi wireframe content}
    </div>
  </div>
</div>

Mobile wireframe (375px+):

<div style="max-width:380px; margin:16px 0; border:3px solid #333; border-radius:24px; padding:0; background:#f5f5f0; font-family:'Comic Sans MS','Segoe Print',cursive; box-shadow:0 4px 12px rgba(0,0,0,0.1); overflow:hidden">
  <div style="background:#444; color:#eee; padding:10px 14px; display:flex; justify-content:space-between; align-items:center; border-bottom:2px dashed #666">
    <b>{App Name}</b>
    <span>Menu</span>
  </div>
  <div style="padding:14px">
    <div style="font-size:18px; font-weight:bold; border-bottom:2px dashed #bbb; padding-bottom:8px; margin-bottom:12px">{Mobile Page Title}</div>
    <div style="display:grid; gap:8px">
      <div style="border:2px dashed #bbb; border-radius:6px; padding:12px; background:#fafafa">{Primary card}</div>
      <div style="border:2px dashed #bbb; border-radius:6px; padding:12px; background:#fafafa">{Secondary card}</div>
      <div style="border:2px dashed #bbb; border-radius:6px; padding:12px; background:#fafafa">{Primary action}</div>
    </div>
  </div>
</div>

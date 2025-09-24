const BRAND = {
  name: "flavorHUB254",
  logo: "/assets/flavorhubicon.png",
  bg: "#FFF8E7",
  primary: "#2E7D32",
  accent: "#a94f4f",
  divider: "#DDD",
  text: "#232323",
  muted: "#666",
  footerBg: "#FAFAFA",
  hubRed: "#D32F2F",
  green254: "#2E7D32",
};

export default function RecipePDF({ recipe }) {
  if (!recipe) return null;

  const instructionListClass = "fh254-instructions-list";

  return (
    <div
      style={{
        background: BRAND.bg,
        color: BRAND.text,
        fontFamily: "Inter, Arial, sans-serif",
        width: 794, // A4 width at 96dpi
        // minHeight: 1123, // A4 height at 96dpi
        boxSizing: "border-box",
        margin: "0 auto",
        padding: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 2px 16px #0001",
      }}
    >
      {/* Style for colored instruction numbers */}
      <style>
        {`
          .${instructionListClass} > li::marker {
            color: ${BRAND.accent};
            font-weight: bold;
            font-size: 1.1em;
          }
        `}
      </style>

      {/* --- RECIPE TITLE --- */}
      <div
        style={{
          width: "100%",
          textAlign: "center",
          marginTop: 5,
          marginBottom: 0,
          padding: "0 32px",
        }}
      >
        <span
          style={{
            fontWeight: 800,
            fontSize: 38,
            color: BRAND.primary,
            lineHeight: 1.15,
            wordBreak: "break-word",
            display: "inline-block",
            maxWidth: 650,
          }}
        >
          {recipe.title}
        </span>
      </div>

      {/* Main Content: Two columns for ingredients/image */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: 36,
          padding: "36px 48px 0 48px",
        }}
      >
        {/* Left: Ingredients */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* --- CATEGORY BADGE --- */}
          <div
            style={{
              marginBottom: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
            }}
          >
            <span
              style={{
                background: BRAND.primary,
                color: "#fff",
                fontWeight: 700,
                fontSize: 18,
                borderRadius: 9999,
                padding: "4px 16px",
                height: 40,
                textAlign: "center",
                letterSpacing: 0.5,
                minWidth: 0,
                boxSizing: "border-box",
                boxShadow: "none",
              }}
            >
              {recipe.category || "Recipe"}
            </span>
          </div>

          {/* Description */}
          {recipe.description && (
            <div
              style={{
                background: "#fff",
                color: BRAND.text,
                borderRadius: 10,
                padding: "14px 18px",
                marginBottom: 22,
                fontWeight: 500,
                fontSize: 16,
                border: `1px solid ${BRAND.divider}`,
                boxShadow: "0 1px 4px #0001",
                lineHeight: 1.6,
              }}
            >
              {recipe.description}
            </div>
          )}

          {/* Ingredients Section */}
          <h2
            style={{
              fontSize: 23,
              fontWeight: 700,
              color: BRAND.primary,
              margin: "0 0 8px 0",
              paddingBottom: 4,
              marginBottom: 8,
              borderBottom: `2px solid ${BRAND.accent}`,
              letterSpacing: 0.2,
            }}
          >
            Ingredients
          </h2>
          <div
            style={{
              background: "#fff",
              borderRadius: 10,
              padding: "18px 18px 14px 18px",
              marginBottom: 28,
              boxShadow: "0 1px 4px #0001",
              border: `1px solid ${BRAND.divider}`,
            }}
          >
            <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0 ? (
                recipe.ingredients.map((item, idx) => (
                  <li
                    key={idx}
                    style={{
                      fontSize: 17,
                      fontWeight: 500,
                      color: BRAND.text,
                      marginBottom: 10,
                      lineHeight: 1.6,
                      borderBottom:
                        idx !== recipe.ingredients.length - 1
                          ? `1px solid #F2F2F2`
                          : "none",
                      paddingBottom: 6,
                    }}
                  >
                    {item.amount} {item.unit} {item.name}
                  </li>
                ))
              ) : (
                <li>No ingredients listed.</li>
              )}
            </ul>
          </div>
        </div>

        {/* Right: Image & Metadata */}
        <div
          style={{
            flex: 0.95,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            minWidth: 0,
            marginTop: 8,
          }}
        >
          {/* Recipe Image */}
          {recipe.image?.url && (
            <img
              src={recipe.image.url}
              alt={recipe.image.alt || recipe.title || "Recipe"}
              width={320}
              height={240}
              style={{
                borderRadius: 12,
                boxShadow: `0 4px 24px ${BRAND.accent}33`,
                border: `2.5px solid ${BRAND.accent}`,
                objectFit: "cover",
                marginBottom: 28,
                maxWidth: "100%",
                background: "#fff",
                display: "block",
              }}
              crossOrigin="anonymous"
            />
          )}

          {/* Metadata Box */}
          <div
            style={{
              background: BRAND.accent,
              color: "#fff",
              borderRadius: 10,
              padding: "18px 22px",
              fontWeight: 500,
              fontSize: 16,
              marginBottom: 18,
              boxShadow: "0 1px 6px #0001",
              minWidth: 220,
              textAlign: "left",
              border: `1px solid ${BRAND.divider}`,
              lineHeight: 1.7,
              display: "flex",
              flexDirection: "column",
              gap: 8,
              alignItems: "flex-start",
              justifyContent: "center",
            }}
          >
            <div>
              <span style={{ color: "#fff", marginRight: 6 }}>⏱</span>
              <b>Prep Time:</b> {recipe.time || "N/A"} min
            </div>
            <div>
              <span style={{ color: "#fff", marginRight: 6 }}>🍽</span>
              <b>Yields:</b> {recipe.base_servings || "N/A"} servings
            </div>
            {recipe.rating && (
              <div>
                <span style={{ color: "#fff", marginRight: 6 }}>⭐</span>
                <b>Rating:</b> {recipe.rating.toFixed(1)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Instructions: Full width below columns */}
      <div
        style={{
          padding: "32px 48px 0 48px",
          width: "100%",
        }}
      >
        <h2
          style={{
            fontSize: 23,
            fontWeight: 700,
            color: BRAND.primary,
            margin: "32px 0 8px 0",
            paddingBottom: 4,
            marginBottom: 8,
            borderBottom: `2px solid ${BRAND.accent}`,
            letterSpacing: 0.2,
          }}
        >
          Instructions
        </h2>
        <div
          style={{
            background: "#fff",
            borderRadius: 10,
            padding: "18px 18px 40px 18px", // increased bottom padding
            marginBottom: 0,
            boxShadow: "0 1px 4px #0001",
            border: `1px solid ${BRAND.divider}`,
          }}
        >
          <ul
            style={{
              margin: 0,
              paddingLeft: 0,
              fontSize: 17,
              color: BRAND.text,
              lineHeight:2.0, // slightly increased line height
              listStyle: "none",
              textAlign: "left",
            }}
          >
            {Array.isArray(recipe.instructions) && recipe.instructions.length > 0 ? (
              recipe.instructions.map((step, idx) => (
                <li
                  key={idx}
                  style={{
                    margin: 0,
                    marginBottom: 24, // increased space between steps
                    display: "flex",
                    alignItems: "flex-start",
                  }}
                >
                  <span
                    style={{
                      minWidth: 28,
                      fontWeight: "bold",
                      color: BRAND.accent,
                      fontSize: "1.1em",
                      display: "inline-block",
                      textAlign: "right",
                      marginRight: 8,
                      lineHeight: 1.6,
                    }}
                  >
                    {idx + 1}.
                  </span>
                  <span style={{ flex: 1 }}>
                    {step.replace(/^\d+\.\s*/, "")}
                  </span>
                </li>
              ))
            ) : (
              <li>No instructions listed.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}


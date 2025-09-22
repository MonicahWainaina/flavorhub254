export default function RecipePDF({ recipe }) {
  if (!recipe) return null;

  return (
    <div
      style={{
        background: '#FFF8E7',
        color: '#232323',
        padding: 32,
        borderRadius: 16,
        fontFamily: 'sans-serif',
        minHeight: '100vh',
        width: 736,
        boxSizing: 'border-box',
      }}
    >
      <div style={{ borderBottom: '1px solid #ccc', paddingBottom: 8, marginBottom: 16, display: 'flex', alignItems: 'center' }}>
        <img
          src="/assets/flavorhubicon.png"
          alt="FlavorHUB254"
          width={120}
          height={40}
          style={{ objectFit: 'contain' }}
        />
        <span style={{ fontSize: 20, fontWeight: 'bold', marginLeft: 16 }}>
          {recipe.title || 'Recipe'}
        </span>
      </div>

      {/* Recipe Image */}
      {recipe.image?.url && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <img
            id="pdf-recipe-image"
            src={recipe.image.url}
            alt={recipe.image.alt || recipe.title || 'Recipe'}
            width={320}
            height={220}
            style={{
              borderRadius: 12,
              boxShadow: '0 2px 8px #0002',
              objectFit: 'cover',
            }}
            crossOrigin="anonymous"
          />
        </div>
      )}

      <div>
        <h1 style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 8 }}>
          {recipe.title || 'Recipe'}
        </h1>
        {recipe.description && <p style={{ marginBottom: 8 }}>{recipe.description}</p>}
        <div>
          <strong>Category:</strong> {recipe.category || 'N/A'} &nbsp;|&nbsp;
          <strong>Servings:</strong> {recipe.base_servings || 'N/A'}
        </div>
      </div>
      <div style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Ingredients</h2>
        <ul>
          {Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0 ? (
            recipe.ingredients.map((item, idx) => (
              <li key={idx}>
                {item.amount} {item.unit} {item.name}
              </li>
            ))
          ) : (
            <li>No ingredients listed.</li>
          )}
        </ul>
      </div>
      <div style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Instructions</h2>
        <ol>
          {Array.isArray(recipe.instructions) && recipe.instructions.length > 0 ? (
            recipe.instructions.map((step, idx) => (
              <li key={idx}>{step}</li>
            ))
          ) : (
            <li>No instructions listed.</li>
          )}
        </ol>
      </div>
      <div
        style={{
          borderTop: '1px solid #ccc',
          marginTop: 32,
          paddingTop: 8,
          fontSize: 12,
          opacity: 0.8,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span>© {new Date().getFullYear()} FlavorHUB254</span>
        <span>
          {recipe.title || 'Recipe'} | {new Date().toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}
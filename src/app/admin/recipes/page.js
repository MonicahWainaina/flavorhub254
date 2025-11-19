'use client';
import { useEffect, useState } from "react";
import AdminAuthGuard from "../../../components/AdminAuthGuard";
import AdminHeader from "../../../components/AdminHeader";
import AdminFooter from "../../../components/AdminFooter";
import { db } from "../../../lib/firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  deleteDoc,
  updateDoc,
  addDoc,
  setDoc,
  getDoc,
} from "firebase/firestore";

// Slugify utility: turns "Red Velvet Cake" into "red-velvet-cake"
function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function emptyRecipe(selectedCategory) {
  return {
    title: "",
    category: selectedCategory ? selectedCategory.title : "",
    image: { url: "", alt: "" },
    tags: [],
    description: "",
    base_servings: 1,
    min_servings: 1,
    max_servings: 20,
    time: 0,
    rating: 0,
    ingredients: [{ name: "", amount: "", unit: "", editable: false, min: "", max: "" }],
    instructions: [""],
    premium_feature: false,
    editable_ingredients: false,
    adjustable_servings: false,
    scaling_step: 10,
    pdf: { enabled: false, url: "" },
    audio: { has_audio_instruction: false, mp3_url: "" },
    smart_cooking: { enabled: false },
    slug: "",
    features: [],
    created_by: "",
    version: 1,
  };
}

export default function AdminRecipesPage() {
  const [categories, setCategories] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [search, setSearch] = useState("");
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [newCategory, setNewCategory] = useState({ title: "", imageUrl: "", description: "", order: null });
  const [isEditingCategory, setIsEditingCategory] = useState(false);

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      setCategoryLoading(true);
      const q = query(collection(db, "categories"), orderBy("order"));
      const snap = await getDocs(q);
      setCategories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setCategoryLoading(false);
    }
    fetchCategories();
  }, []);

  // Fetch recipes
  useEffect(() => {
    async function fetchRecipes() {
      setLoading(true);
      const q = query(collection(db, "recipes"), orderBy("title"));
      const snap = await getDocs(q);
      setRecipes(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }
    fetchRecipes();
  }, []);

  // Filter recipes by selected category and search
  const filteredRecipes = recipes.filter(
    r =>
      (!selectedCategory || r.category === selectedCategory.title) &&
      (
        r.title?.toLowerCase().includes(search.toLowerCase()) ||
        r.category?.toLowerCase().includes(search.toLowerCase()) ||
        (r.tags && r.tags.join(" ").toLowerCase().includes(search.toLowerCase()))
      )
  );

  // Delete recipe
  async function handleDeleteRecipe(recipe) {
    if (!window.confirm(`Delete recipe "${recipe.title}"? This cannot be undone.`)) return;
    setActionLoading(prev => ({ ...prev, [recipe.id]: true }));
    await deleteDoc(doc(db, "recipes", recipe.id));
    setRecipes(recipes => recipes.filter(r => r.id !== recipe.id));
    setActionLoading(prev => ({ ...prev, [recipe.id]: false }));
  }

  // Edit recipe (open modal, always fetch latest from Firestore)
  async function handleEditRecipe(recipe) {
    try {
      const docRef = doc(db, "recipes", recipe.id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSelectedRecipe({ id: recipe.id, ...docSnap.data() });
      } else {
        setSelectedRecipe(recipe); // fallback
      }
      setShowRecipeModal(true);
    } catch (err) {
      setSelectedRecipe(recipe);
      setShowRecipeModal(true);
    }
  }

  // Add new recipe (open modal)
  function handleAddRecipe() {
    setSelectedRecipe(emptyRecipe(selectedCategory));
    setShowRecipeModal(true);
  }

  // Save recipe (add or update)
  async function handleSaveRecipe(updated) {
    setActionLoading(prev => ({ ...prev, [updated.id || "new"]: true }));

    // Always generate slug from title
    updated.slug = slugify(updated.title);

    // Features array for compatibility
    updated.features = [];
    if (updated.smart_cooking?.enabled) updated.features.push("smart_cooking");
    if (updated.pdf?.enabled) updated.features.push("pdf_download");
    if (updated.audio?.has_audio_instruction) updated.features.push("audio_instruction");

    if (updated.id) {
      await updateDoc(doc(db, "recipes", updated.id), updated);
      setRecipes(recipes =>
        recipes.map(r => (r.id === updated.id ? { ...r, ...updated } : r))
      );
    } else {
      const docRef = await addDoc(collection(db, "recipes"), updated);
      setRecipes(recipes => [...recipes, { ...updated, id: docRef.id }]);
    }
    setActionLoading(prev => ({ ...prev, [updated.id || "new"]: false }));
    setShowRecipeModal(false);
    setSelectedRecipe(null);
  }

  // Add new category (open modal)
  function handleAddCategory() {
    setNewCategory({ title: "", imageUrl: "", description: "", order: categories.length + 1 });
    setIsEditingCategory(false);
    setShowCategoryModal(true);
  }

  // Edit category (open modal)
  function handleEditCategory(cat) {
    setNewCategory({ ...cat });
    setIsEditingCategory(true);
    setShowCategoryModal(true);
  }

  // Save category (add or update)
  async function handleSaveCategory() {
    if (!newCategory.title || !newCategory.imageUrl) {
      alert("Title and image are required.");
      return;
    }
    const catDoc = doc(db, "categories", newCategory.title);
    await setDoc(catDoc, {
      ...newCategory,
      id: newCategory.title,
      order: newCategory.order || categories.length + 1,
    });
    setCategories(cats => {
      const exists = cats.find(c => c.id === newCategory.title);
      if (exists) {
        // Update existing
        return cats.map(c => c.id === newCategory.title ? { ...c, ...newCategory } : c);
      } else {
        // Add new
        return [...cats, { ...newCategory, id: newCategory.title, order: categories.length + 1 }];
      }
    });
    setShowCategoryModal(false);
    setIsEditingCategory(false);
  }

  // UI
  return (
    <AdminAuthGuard>
      <div className="min-h-screen flex flex-col bg-[#181818] pt-20">
        <AdminHeader />
        <main className="flex-1 max-w-6xl mx-auto py-6 px-2 sm:py-12 sm:px-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">Recipe Management</h1>
          {!selectedCategory && (
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Categories</h2>
              <button
                onClick={handleAddCategory}
                className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded text-sm"
              >
                Add Category
              </button>
            </div>
          )}
          {/* Category Grid */}
          {!selectedCategory && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 gap-y-8 mb-10">
              {categoryLoading ? (
                <div className="col-span-4 text-center text-gray-400">Loading categories...</div>
              ) : (
                categories.map(cat => (
                  <div
                    key={cat.id}
                    className="bg-[#232323] rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition flex flex-col items-center border-2 border-transparent hover:border-green-700 relative"
                  >
                    <button
                      className="absolute top-2 right-2 bg-blue-700 hover:bg-blue-800 text-white px-2 py-1 rounded text-xs z-10"
                      onClick={e => {
                        e.stopPropagation();
                        handleEditCategory(cat);
                      }}
                      title="Edit Category"
                      type="button"
                    >
                      Edit
                    </button>
                    <button
                      className="w-full flex flex-col items-center"
                      onClick={() => setSelectedCategory(cat)}
                      type="button"
                    >
                      <img
                        src={cat.imageUrl}
                        alt={cat.title}
                        className="w-full h-32 object-cover"
                      />
                      <div className="p-3 text-white font-semibold">{cat.title}</div>
                      {cat.description && (
                        <div className="px-3 pb-3 text-gray-400 text-xs text-center">{cat.description}</div>
                      )}
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Recipes in Category */}
          {selectedCategory && (
            <>
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="text-green-400 hover:underline text-sm"
                >
                  &larr; Back to Categories
                </button>
                <button
                  onClick={handleAddRecipe}
                  className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded text-sm"
                >
                  Add Recipe
                </button>
              </div>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search by title, tag..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full sm:w-96 px-4 py-2 rounded bg-[#232323] text-white border border-gray-700"
                />
              </div>
              {loading ? (
                <div className="text-center text-gray-400 py-12">Loading recipes...</div>
              ) : filteredRecipes.length === 0 ? (
                <div className="text-center text-gray-400 py-12">No recipes found in this category.</div>
              ) : (
                <div className="overflow-x-auto rounded-lg shadow">
                  <table className="w-full bg-[#232323] text-white text-xs sm:text-sm">
                    <thead>
                      <tr>
                        <th className="px-2 sm:px-4 py-2 text-left">Image</th>
                        <th className="px-2 sm:px-4 py-2 text-left">Title</th>
                        <th className="px-2 sm:px-4 py-2 text-left">Tags</th>
                        <th className="px-2 sm:px-4 py-2 text-left">Premium</th>
                        <th className="px-2 sm:px-4 py-2 text-left">PDF</th>
                        <th className="px-2 sm:px-4 py-2 text-left">Audio</th>
                        <th className="px-2 sm:px-4 py-2 text-left">Smart</th>
                        <th className="px-2 sm:px-4 py-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRecipes.map(recipe => (
                        <tr key={recipe.id} className="border-t border-gray-700">
                          <td className="px-2 sm:px-4 py-2">
                            {recipe.image?.url ? (
                              <img
                                src={recipe.image.url}
                                alt={recipe.image.alt || recipe.title}
                                className="w-16 h-16 object-cover rounded"
                              />
                            ) : (
                              <span className="text-gray-500">No image</span>
                            )}
                          </td>
                          <td className="px-2 sm:px-4 py-2 font-semibold">{recipe.title}</td>
                          <td className="px-2 sm:px-4 py-2">
                            {recipe.tags ? recipe.tags.join(", ") : "-"}
                          </td>
                          <td className="px-2 sm:px-4 py-2">
                            {recipe.premium_feature ? (
                              <span className="text-yellow-400 font-semibold">Yes</span>
                            ) : (
                              <span className="text-gray-400">No</span>
                            )}
                          </td>
                          <td className="px-2 sm:px-4 py-2">
                            {recipe.pdf?.url ? (
                              <a
                                href={recipe.pdf.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-400 underline"
                              >
                                PDF
                              </a>
                            ) : (
                              <span className="text-gray-400 text-xs italic">Browser-generated</span>
                            )}
                          </td>
                          <td className="px-2 sm:px-4 py-2">
                            {recipe.audio?.has_audio_instruction && recipe.audio?.mp3_url ? (
                              <a
                                href={recipe.audio.mp3_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 underline"
                              >
                                Audio
                              </a>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-2 sm:px-4 py-2">
                            {recipe.smart_cooking?.enabled ? (
                              <span className="text-green-400 font-semibold">Yes</span>
                            ) : (
                              <span className="text-gray-400">No</span>
                            )}
                          </td>
                          <td className="px-2 sm:px-4 py-2">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditRecipe(recipe)
                                }
                                className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs"
                              >
                                Edit
                              </button>
                              <button
                                disabled={actionLoading[recipe.id]}
                                onClick={() => handleDeleteRecipe(recipe)}
                                className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
                              >
                                {actionLoading[recipe.id] ? "..." : "Delete"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* Add/Edit Recipe Modal */}
          {showRecipeModal && selectedRecipe && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
              <div className="bg-[#232323] rounded-lg p-8 max-w-lg w-full text-white relative overflow-y-auto max-h-[90vh]">
                <button
                  className="absolute top-2 right-4 text-2xl"
                  onClick={() => setShowRecipeModal(false)}
                  aria-label="Close"
                >
                  &times;
                </button>
                <h2 className="text-2xl font-bold mb-4">{selectedRecipe.id ? "Edit Recipe" : "Add Recipe"}</h2>
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    handleSaveRecipe(selectedRecipe);
                  }}
                  className="space-y-3"
                >
                  {/* Title */}
                  <div>
                    <label className="block text-sm mb-1">Title</label>
                    <input
                      type="text"
                      value={selectedRecipe.title}
                      onChange={e =>
                        setSelectedRecipe(r => ({ ...r, title: e.target.value }))
                      }
                      className="w-full px-3 py-2 rounded bg-[#181818] border border-gray-700 text-white"
                      required
                    />
                  </div>
                  {/* Slug (auto-generated, read-only) */}
                  <div>
                    <label className="block text-sm mb-1">Slug (auto-generated)</label>
                    <input
                      type="text"
                      value={slugify(selectedRecipe.title)}
                      className="w-full px-3 py-2 rounded bg-[#181818] border border-gray-700 text-white"
                      disabled
                    />
                  </div>
                  {/* Category */}
                  <div>
                    <label className="block text-sm mb-1">Category</label>
                    <select
                      value={selectedRecipe.category}
                      onChange={e =>
                        setSelectedRecipe(r => ({ ...r, category: e.target.value }))
                      }
                      className="w-full px-3 py-2 rounded bg-[#181818] border border-gray-700 text-white"
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.title}>
                          {cat.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Image */}
                  <div>
                    <label className="block text-sm mb-1">Image URL</label>
                    <input
                      type="text"
                      value={selectedRecipe.image?.url || ""}
                      onChange={e =>
                        setSelectedRecipe(r => ({
                          ...r,
                          image: { ...r.image, url: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 rounded bg-[#181818] border border-gray-700 text-white"
                    />
                  </div>
                  {/* Tags */}
                  <div>
                    <label className="block text-sm mb-1">Tags (comma separated)</label>
                    <input
                      type="text"
                      value={selectedRecipe.tags?.join(", ") || ""}
                      onChange={e =>
                        setSelectedRecipe(r => ({
                          ...r,
                          tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean),
                        }))
                      }
                      className="w-full px-3 py-2 rounded bg-[#181818] border border-gray-700 text-white"
                    />
                  </div>
                  {/* Description */}
                  <div>
                    <label className="block text-sm mb-1">Description</label>
                    <textarea
                      value={selectedRecipe.description || ""}
                      onChange={e =>
                        setSelectedRecipe(r => ({ ...r, description: e.target.value }))
                      }
                      className="w-full px-3 py-2 rounded bg-[#181818] border border-gray-700 text-white"
                      rows={2}
                    />
                  </div>
                  {/* Servings and Time */}
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-sm mb-1">Base Servings</label>
                      <input
                        type="number"
                        min={1}
                        value={selectedRecipe.base_servings || ""}
                        onChange={e =>
                          setSelectedRecipe(r => ({
                            ...r,
                            base_servings: Number(e.target.value),
                          }))
                        }
                        className="w-full px-3 py-2 rounded bg-[#181818] border border-gray-700 text-white"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm mb-1">Time (min)</label>
                      <input
                        type="number"
                        min={0}
                        value={selectedRecipe.time || ""}
                        onChange={e =>
                          setSelectedRecipe(r => ({
                            ...r,
                            time: Number(e.target.value),
                          }))
                        }
                        className="w-full px-3 py-2 rounded bg-[#181818] border border-gray-700 text-white"
                      />
                    </div>
                  </div>
                  {/* Min/Max Servings */}
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-sm mb-1">Min Servings</label>
                      <input
                        type="number"
                        min={1}
                        value={selectedRecipe.min_servings || ""}
                        onChange={e =>
                          setSelectedRecipe(r => ({
                            ...r,
                            min_servings: Number(e.target.value),
                          }))
                        }
                        className="w-full px-3 py-2 rounded bg-[#181818] border border-gray-700 text-white"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm mb-1">Max Servings</label>
                      <input
                        type="number"
                        min={1}
                        value={selectedRecipe.max_servings || ""}
                        onChange={e =>
                          setSelectedRecipe(r => ({
                            ...r,
                            max_servings: Number(e.target.value),
                          }))
                        }
                        className="w-full px-3 py-2 rounded bg-[#181818] border border-gray-700 text-white"
                      />
                    </div>
                  </div>
                  {/* Editable Ingredients */}
                  <div>
                    <label className="block text-sm mb-1">Editable Ingredients</label>
                    <input
                      type="checkbox"
                      checked={!!selectedRecipe.editable_ingredients}
                      onChange={e => {
                        // If enabling, turn off adjustable_servings and clear min/max
                        const checked = e.target.checked;
                        setSelectedRecipe(r => ({
                          ...r,
                          editable_ingredients: checked,
                          adjustable_servings: checked ? false : r.adjustable_servings,
                          min_servings: checked ? 1 : r.min_servings,
                          max_servings: checked ? 20 : r.max_servings,
                          // If disabling, also clear all ingredient editable flags
                          ingredients: checked
                            ? r.ingredients
                            : r.ingredients.map(i => ({ ...i, editable: false })),
                        }));
                      }}
                      disabled={selectedRecipe.adjustable_servings}
                    /> Enable
                  </div>

                  {/* Adjustable Servings */}
                  <div>
                    <label className="block text-sm mb-1">Adjustable Servings</label>
                    <input
                      type="checkbox"
                      checked={!!selectedRecipe.adjustable_servings}
                      onChange={e => {
                        // If enabling, turn off editable_ingredients and clear all ingredient editable flags
                        const checked = e.target.checked;
                        setSelectedRecipe(r => ({
                          ...r,
                          adjustable_servings: checked,
                          editable_ingredients: checked ? false : r.editable_ingredients,
                          ingredients: checked
                            ? r.ingredients.map(i => ({ ...i, editable: false }))
                            : r.ingredients,
                        }));
                      }}
                      disabled={selectedRecipe.editable_ingredients}
                    /> Enable
                  </div>

                  {/* Min/Max Servings (only if adjustable_servings is enabled) */}
                  {selectedRecipe.adjustable_servings && (
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block text-sm mb-1">Min Servings</label>
                        <input
                          type="number"
                          min={1}
                          value={selectedRecipe.min_servings || ""}
                          onChange={e =>
                            setSelectedRecipe(r => ({
                              ...r,
                              min_servings: Number(e.target.value),
                            }))
                          }
                          className="w-full px-3 py-2 rounded bg-[#181818] border border-gray-700 text-white"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm mb-1">Max Servings</label>
                        <input
                          type="number"
                          min={1}
                          value={selectedRecipe.max_servings || ""}
                          onChange={e =>
                            setSelectedRecipe(r => ({
                              ...r,
                              max_servings: Number(e.target.value),
                            }))
                          }
                          className="w-full px-3 py-2 rounded bg-[#181818] border border-gray-700 text-white"
                        />
                      </div>
                    </div>
                  )}

                  {/* Scaling Step (only if editable_ingredients is enabled) */}
                  {selectedRecipe.editable_ingredients && (
                    <div>
                      <label className="block text-sm mb-1">Scaling Step (for editable ingredient)</label>
                      <input
                        type="number"
                        min={1}
                        value={selectedRecipe.scaling_step || 10}
                        onChange={e =>
                          setSelectedRecipe(r => ({
                            ...r,
                            scaling_step: Number(e.target.value),
                          }))
                        }
                        className="w-full px-3 py-2 rounded bg-[#181818] border border-gray-700 text-white"
                      />
                    </div>
                  )}

                  {/* Ingredients */}
                  <div>
                    <label className="block text-sm mb-1">Ingredients</label>
                    {selectedRecipe.ingredients?.map((ing, idx) => (
                      <div key={idx} className="flex gap-2 mb-1">
                        <input
                          type="text"
                          placeholder="Name"
                          value={ing.name}
                          onChange={e => {
                            const newIngredients = [...selectedRecipe.ingredients];
                            newIngredients[idx].name = e.target.value;
                            setSelectedRecipe(r => ({ ...r, ingredients: newIngredients }));
                          }}
                          className="flex-1 px-2 py-1 rounded bg-[#181818] border border-gray-700 text-white"
                          required
                        />
                        <input
                          type="number"
                          placeholder="Amount"
                          value={ing.amount}
                          onChange={e => {
                            const newIngredients = [...selectedRecipe.ingredients];
                            newIngredients[idx].amount = e.target.value;
                            setSelectedRecipe(r => ({ ...r, ingredients: newIngredients }));
                          }}
                          className="w-20 px-2 py-1 rounded bg-[#181818] border border-gray-700 text-white"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Unit"
                          value={ing.unit}
                          onChange={e => {
                            const newIngredients = [...selectedRecipe.ingredients];
                            newIngredients[idx].unit = e.target.value;
                            setSelectedRecipe(r => ({ ...r, ingredients: newIngredients }));
                          }}
                          className="w-16 px-2 py-1 rounded bg-[#181818] border border-gray-700 text-white"
                        />
                        {/* Editable checkbox: only if editable_ingredients is enabled */}
                        <label className="text-xs text-gray-400 flex items-center">
                          <input
                            type="checkbox"
                            checked={!!ing.editable}
                            onChange={e => {
                              // Only allow one editable at a time
                              const newIngredients = selectedRecipe.ingredients.map((item, i) => ({
                                ...item,
                                editable: i === idx ? e.target.checked : false,
                              }));
                              setSelectedRecipe(r => ({ ...r, ingredients: newIngredients }));
                            }}
                            disabled={
                              !selectedRecipe.editable_ingredients ||
                              (ing.editable
                                ? false
                                : selectedRecipe.ingredients.some(i => i.editable))
                            }
                          /> Editable
                        </label>
                        <input
                          type="number"
                          placeholder="Min"
                          value={ing.min || ""}
                          onChange={e => {
                            const newIngredients = [...selectedRecipe.ingredients];
                            newIngredients[idx].min = e.target.value;
                            setSelectedRecipe(r => ({ ...r, ingredients: newIngredients }));
                          }}
                          className="w-14 px-2 py-1 rounded bg-[#181818] border border-gray-700 text-white"
                          disabled={!selectedRecipe.editable_ingredients}
                        />
                        <input
                          type="number"
                          placeholder="Max"
                          value={ing.max || ""}
                          onChange={e => {
                            const newIngredients = [...selectedRecipe.ingredients];
                            newIngredients[idx].max = e.target.value;
                            setSelectedRecipe(r => ({ ...r, ingredients: newIngredients }));
                          }}
                          className="w-14 px-2 py-1 rounded bg-[#181818] border border-gray-700 text-white"
                          disabled={!selectedRecipe.editable_ingredients}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newIngredients = selectedRecipe.ingredients.filter((_, i) => i !== idx);
                            setSelectedRecipe(r => ({ ...r, ingredients: newIngredients }));
                          }}
                          className="text-red-400 px-2"
                          disabled={selectedRecipe.ingredients.length === 1}
                          title="Remove ingredient"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedRecipe(r => ({
                          ...r,
                          ingredients: [...(r.ingredients || []), { name: "", amount: "", unit: "", editable: false, min: "", max: "" }],
                        }))
                      }
                      className="text-green-400 text-xs mt-1"
                    >
                      + Add Ingredient
                    </button>
                  </div>
                  {/* Instructions */}
                  <div>
                    <label className="block text-sm mb-1">Instructions</label>
                    {selectedRecipe.instructions?.map((step, idx) => (
                      <div key={idx} className="flex gap-2 mb-1">
                        <textarea
                          value={step}
                          onChange={e => {
                            const newInstructions = [...selectedRecipe.instructions];
                            newInstructions[idx] = e.target.value;
                            setSelectedRecipe(r => ({ ...r, instructions: newInstructions }));
                          }}
                          className="flex-1 px-2 py-1 rounded bg-[#181818] border border-gray-700 text-white"
                          rows={1}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newInstructions = selectedRecipe.instructions.filter((_, i) => i !== idx);
                            setSelectedRecipe(r => ({ ...r, instructions: newInstructions }));
                          }}
                          className="text-red-400 px-2"
                          disabled={selectedRecipe.instructions.length === 1}
                          title="Remove step"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedRecipe(r => ({
                          ...r,
                          instructions: [...(r.instructions || []), ""],
                        }))
                      }
                      className="text-green-400 text-xs mt-1"
                    >
                      + Add Step
                    </button>
                  </div>
                  {/* Premium, PDF, Audio, Smart toggles */}
                  <div>
                    <label className="block text-sm mb-1">Premium Feature</label>
                    <input
                      type="checkbox"
                      checked={!!selectedRecipe.premium_feature}
                      onChange={e =>
                        setSelectedRecipe(r => ({
                          ...r,
                          premium_feature: e.target.checked,
                        }))
                      }
                    /> Premium
                  </div>
                  <div>
                    <label className="block text-sm mb-1">PDF</label>
                    <span className="text-gray-400 text-xs italic">
                      PDFs are generated on demand in the browser and are not stored.
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Audio Instruction</label>
                    {selectedRecipe.audio?.has_audio_instruction && selectedRecipe.audio?.mp3_url ? (
                      <a
                        href={selectedRecipe.audio.mp3_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 underline"
                      >
                        Listen to Audio
                      </a>
                    ) : (
                      <span className="text-gray-400 text-xs italic">
                        Audio is generated by backend and cannot be edited here.
                      </span>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Smart Cooking</label>
                    {selectedRecipe.smart_cooking?.enabled ? (
                      <span className="text-green-400 text-xs font-semibold">
                        Enabled by backend
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs italic">
                        Not enabled
                      </span>
                    )}
                  </div>

                  {/* ...rest of your modal fields (created_by, version, etc.) ... */}

                  <div className="flex justify-end mt-4">
                    <button
                      type="submit"
                      className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded text-sm"
                      disabled={actionLoading[selectedRecipe.id || "new"]}
                    >
                      {selectedRecipe.id ? "Save" : "Add"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Add/Edit Category Modal */}
          {showCategoryModal && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
              <div className="bg-[#232323] rounded-lg p-8 max-w-lg w-full text-white relative">
                <button
                  className="absolute top-2 right-4 text-2xl"
                  onClick={() => {
                    setShowCategoryModal(false);
                    setIsEditingCategory(false);
                  }}
                  aria-label="Close"
                >
                  &times;
                </button>
                <h2 className="text-2xl font-bold mb-4">{isEditingCategory ? "Edit Category" : "Add Category"}</h2>
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    handleSaveCategory();
                  }}
                  className="space-y-3"
                >
                  <div>
                    <label className="block text-sm mb-1">Title</label>
                    <input
                      type="text"
                      value={newCategory.title}
                      onChange={e =>
                        setNewCategory(c => ({ ...c, title: e.target.value }))
                      }
                      className="w-full px-3 py-2 rounded bg-[#181818] border border-gray-700 text-white"
                      required
                      disabled={isEditingCategory}
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Image URL</label>
                    <input
                      type="text"
                      value={newCategory.imageUrl}
                      onChange={e =>
                        setNewCategory(c => ({ ...c, imageUrl: e.target.value }))
                      }
                      className="w-full px-3 py-2 rounded bg-[#181818] border border-gray-700 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Description</label>
                    <input
                      type="text"
                      value={newCategory.description}
                      onChange={e =>
                        setNewCategory(c => ({ ...c, description: e.target.value }))
                      }
                      className="w-full px-3 py-2 rounded bg-[#181818] border border-gray-700 text-white"
                    />
                  </div>
                  <div className="flex justify-end mt-4">
                    <button
                      type="submit"
                      className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded text-sm"
                    >
                      {isEditingCategory ? "Save Changes" : "Add Category"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
        <AdminFooter />
      </div>
    </AdminAuthGuard>
  );
}
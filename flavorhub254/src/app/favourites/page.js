"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import FavoriteButton from "@/components/FavoriteButton";
import Header from "@/components/Header";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, doc, getDocs, setDoc, deleteDoc } from "firebase/firestore";


export default function FavoritesPage() {
	const { user, loading, username } = useAuth();
	const router = useRouter();

	// --- Carousel logic for categories ---
	const carouselRef = useRef(null);
	const [activeIndex, setActiveIndex] = useState(0);
	const [cardWidth, setCardWidth] = useState(0);

	// --- Recipes state ---
	const [favoriteRecipes, setFavoriteRecipes] = useState([]);
	const [favoriteIds, setFavoriteIds] = useState([]);
	const [recipesPerPage, setRecipesPerPage] = useState(4);
	const [recipePage, setRecipePage] = useState(0);
	const [sortBy, setSortBy] = useState("recent");

	// --- Fetch user's favorites from Firestore ---
	useEffect(() => {
		if (!user) {
			setFavoriteRecipes([]);
			setFavoriteIds([]);
			return;
		}
		async function fetchFavorites() {
			const favsSnap = await getDocs(collection(db, "users", user.uid, "favorites"));
			const favs = favsSnap.docs.map(doc => ({ id: doc.id, ...doc.data().recipe }));
			setFavoriteRecipes(favs);
			setFavoriteIds(favs.map(f => f.id));
		}
		fetchFavorites();
	}, [user]);

	// --- Remove from favorites ---
	const handleToggleFavorite = async (recipe) => {
		if (!user) return;
		const favRef = doc(db, "users", user.uid, "favorites", recipe.id);
		await deleteDoc(favRef);
		setFavoriteRecipes(recipes => recipes.filter(r => r.id !== recipe.id));
		setFavoriteIds(ids => ids.filter(id => id !== recipe.id));
	};

	// --- Responsive recipes per page ---
	useEffect(() => {
		function handleResize() {
			setRecipesPerPage(window.innerWidth >= 640 ? 6 : 4);
		}
		handleResize();
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	// --- Card width for category carousel ---
	useEffect(() => {
		function updateCardWidth() {
			if (carouselRef.current) {
				// Get the first card element
				const firstCard = carouselRef.current.querySelector(".carousel-card");
				if (firstCard) setCardWidth(firstCard.offsetWidth + 24);
			}
		}
		updateCardWidth();
		window.addEventListener("resize", updateCardWidth);
		return () => window.removeEventListener("resize", updateCardWidth);
	}, []);

	// --- Scroll to card by index ---
	const scrollToCard = (idx) => {
		if (carouselRef.current && cardWidth) {
			carouselRef.current.scrollTo({
				left: idx * cardWidth,
				behavior: "smooth",
			});
		}
	};

	// --- Carousel arrows for categories ---
	const scroll = (direction) => {
		let newIndex = activeIndex + (direction === "left" ? -1 : 1);
		newIndex = Math.max(0, Math.min(categories.length - 1, newIndex));
		scrollToCard(newIndex);
	};

	// --- Carousel scroll logic for categories ---
	const handleScroll = () => {
		if (carouselRef.current && cardWidth) {
			const scrollLeft = carouselRef.current.scrollLeft;
			const idx = Math.round(scrollLeft / cardWidth);
			setActiveIndex(idx);
		}
	};
	useEffect(() => {
		const ref = carouselRef.current;
		if (ref) {
			ref.addEventListener("scroll", handleScroll, { passive: true });
			return () => ref.removeEventListener("scroll", handleScroll);
		}
	}, [cardWidth]);

	// --- Sort logic ---
	const sortedRecipes = [...favoriteRecipes].sort((a, b) => {
		if (sortBy === "recent") return 0;
		if (sortBy === "popular") return (b.rating || 0) - (a.rating || 0);
		if (sortBy === "time") return (a.time || 0) - (b.time || 0);
		return 0;
	});

	// --- Pagination ---
	const totalPages = Math.ceil(sortedRecipes.length / recipesPerPage);
	const paginatedRecipes = sortedRecipes.slice(
		recipePage * recipesPerPage,
		(recipePage + 1) * recipesPerPage
	);

	// --- PROTECT PAGE: redirect if not logged in ---
	useEffect(() => {
		if (!loading && !user) {
			router.replace("/login");
		}
	}, [user, loading, router]);

	if (loading || !user) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-[#181818]">
				<span className="text-white text-xl">Loading...</span>
			</div>
		);
	}
    // --- END PROTECTION ---

	// --- 404/Empty State ---
	if (favoriteRecipes.length === 0) {
		return (
			<>
				<Header />
				<main className="min-h-screen bg-[#181818] flex flex-col items-center justify-center">
					<Image
						src="/assets/favourite.svg"
						alt="No favorites"
						width={320}
						height={320}
						className="mb-8"
					/>
					<h2 className="text-3xl font-extrabold text-white mb-2 text-center">
						No Saved Recipes Yet!
					</h2>
					<p className="text-white/80 text-lg mb-6 text-center">
						You have not saved any recipes to your favorites.<br />
						Browse and add some delicious recipes!
					</p>
					<Link href="/browse">
						<button className="bg-[#3CB371] text-white px-6 py-3 rounded-lg font-bold text-lg shadow hover:bg-[#237a4b] transition">
							Browse Recipes
						</button>
					</Link>
				</main>
			</>
		);
	}

	// --- Main Page ---
	return (
		<>
			<Header />
			<main className="min-h-screen bg-[#181818] px-0 py-0">
			{/* Hero Section */}
			<section className="w-full rounded-none shadow-lg relative">
				<div className="relative w-full h-[320px] sm:h-[440px]">
					<Image
						src="/assets/herofood.png"
						alt="Food"
						fill
						className="object-cover object-top"
						priority
					/>
					<div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black/80 flex flex-col items-center justify-center h-full px-2">
						<h1 className="text-3xl sm:text-5xl font-extrabold text-white mb-4 sm:mb-8 text-center drop-shadow-2xl">
							{username ? `${username}'s Favourite Recipes` : "Your Favourite Recipes"}
						</h1>
						{/* Search Bar */}
						<form className="flex w-full max-w-full sm:max-w-xl mx-auto bg-gray-100 rounded-xl shadow-lg">
							<input
								type="text"
								placeholder="What recipe are you looking for ?"
								className="w-full flex-1 min-w-0 px-3 py-2 sm:px-6 sm:py-4 rounded-l-xl text-base sm:text-lg outline-none bg-transparent border-none text-black placeholder-gray-500"
							/>
							<button
								type="submit"
								className="bg-[#3CB371] text-white px-4 py-2 sm:px-10 sm:py-4 rounded-r-xl font-semibold text-base sm:text-lg hover:bg-[#2e8b57] transition"
							>
								Search
							</button>
						</form>
					</div>
				</div>
			</section>
			{/* Divider Line for Recipes Section */}
			<div className="flex justify-center my-8">
				<div className="h-1 w-24 bg-[#3CB371] rounded-full opacity-80"></div>
			</div>
			<h2 className="text-3xl font-extrabold text-white text-center mb-6">
			Your Saved Recipes
			</h2>
			{/* Recipes Carousel Arrows */}
			<div className="flex justify-center sm:justify-end px-4 sm:px-12 mb-4 gap-2">
				<button
					aria-label="Previous"
					className="bg-[#3CB371] rounded-full p-2 text-white hover:bg-[#2e8b57] transition disabled:opacity-50"
					onClick={() => setRecipePage((p) => Math.max(0, p - 1))}
					disabled={recipePage === 0}
				>
					<svg
						width="24"
						height="24"
						fill="none"
						stroke="currentColor"
						strokeWidth="3"
						viewBox="0 0 24 24"
					>
						<path d="M15 19l-7-7 7-7" />
					</svg>
				</button>
				<button
					aria-label="Next"
					className="bg-[#3CB371] rounded-full p-2 text-white hover:bg-[#2e8b57] transition disabled:opacity-50"
					onClick={() => setRecipePage((p) => Math.min(totalPages - 1, p + 1))}
					disabled={recipePage === totalPages - 1}
				>
					<svg
						width="24"
						height="24"
						fill="none"
						stroke="currentColor"
						strokeWidth="3"
						viewBox="0 0 24 24"
					>
						<path d="M9 5l7 7-7 7" />
					</svg>
				</button>
			</div>
			{/* Sort Dropdown */}
			<div className="flex justify-end px-4 sm:px-12 mb-4">
				<label className="text-white font-semibold mr-2">Sort By:</label>
				<select
					value={sortBy}
					onChange={(e) => setSortBy(e.target.value)}
					className="bg-[#3CB371] text-white px-3 py-2 rounded-lg font-bold"
				>
					<option value="recent">Recently Saved</option>
					<option value="popular">Most Popular</option>
					<option value="time">Quickest</option>
				</select>
			</div>
			{/* Recipes Grid */}
			<section className="w-full px-2 sm:px-8 flex flex-col">
				<div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
					{paginatedRecipes.map((recipe) => (
						<div
							key={recipe.id}
							className="flex flex-col sm:flex-row bg-[#a94f4f] rounded-[2.5rem] shadow-lg overflow-hidden min-h-[220px] max-h-[340px] sm:min-h-[170px] sm:max-h-[190px]"
							style={{ minWidth: 0 }}
						>
							{/* Image */}
							<div className="relative w-full h-[120px] sm:w-[48%] sm:h-full flex-shrink-0">
								<Image
									src={recipe.image?.url || "/assets/placeholder.jpg"}
									alt={recipe.image?.alt || recipe.title}
									fill
									className="object-cover w-full h-full sm:rounded-r-[2.5rem] sm:rounded-l-[2.5rem] rounded-t-[2.5rem] sm:rounded-t-none"
									style={{ minHeight: 0, maxHeight: '100%' }}
								/>
							</div>
							{/* Content */}
							<div className="flex flex-col justify-between pt-3 px-3 pb-4 sm:p-4 flex-1 min-w-0">
								<div>
									<span className="font-bold text-white text-base block mb-1">
										{recipe.title}
									</span>
									<div className="flex items-center gap-2 mb-1">
										<svg
											width="18"
											height="18"
											fill="#FFD700"
											viewBox="0 0 20 20"
										>
											<path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.955L10 0l2.951 5.955 6.561.955-4.756 4.635 1.122 6.545z" />
										</svg>
										<span className="text-yellow-300 font-bold text-sm">
											({recipe.rating?.toFixed(1) ?? "N/A"})
										</span>
									</div>
								</div>
								<div className="flex items-center gap-3 mb-1">
									<svg
										width="16"
										height="16"
										fill="none"
										stroke="#fff"
										strokeWidth="2"
										viewBox="0 0 24 24"
									>
										<circle cx="12" cy="12" r="10" />
										<path d="M12 6v6l4 2" />
									</svg>
									<span className="text-white text-sm">
										{recipe.time} mins
									</span>
									{/* Favorite Icon */}
									<FavoriteButton
										isFav={favoriteIds.includes(recipe.id)}
										onClick={() => handleToggleFavorite(recipe)}
									/>
								</div>
								<hr className="border-t border-white/30 my-2" />
								<button className="bg-white text-black px-4 py-2 rounded-lg font-bold w-fit text-sm shadow transition hover:bg-[#3CB371] hover:text-white">
									View Recipe
								</button>
							</div>
						</div>
					))}
				</div>
				{/* Pagination Dots */}
				<div className="flex justify-center mt-4 gap-2">
					{Array.from({ length: totalPages }).map((_, idx) => (
						<button
							key={idx}
							className={`w-3 h-3 rounded-full transition-all duration-200 ${
								idx === recipePage
									? "bg-[#3CB371] scale-125"
									: "bg-gray-400 opacity-60"
							}`}
							onClick={() => setRecipePage(idx)}
							aria-label={`Go to page ${idx + 1}`}
						/>
					))}
				</div>
			</section>
			{/* AI Recipe Generator Section */}
			<section className="w-full mt-12 px-2 sm:px-8">
				<div className="relative w-full rounded-2xl overflow-hidden h-[120px] sm:h-[180px] flex items-center justify-center mb-10">
					<Image
						src="/assets/herofood.png"
						alt="Food background"
						fill
						className="object-cover object-bottom w-full h-full"
						priority={false}
					/>
					<div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
						<h3 className="text-white text-lg sm:text-2xl font-bold text-center mb-3">
							Try Our AI Smart Generator for all your food and recipe queries
						</h3>
						<button className="bg-[#3CB371] text-white font-bold px-6 py-2 rounded-lg flex items-center gap-2 text-lg shadow hover:bg-[#237a4b] transition">
							Ask FlavorBot
							<span>
								<svg
									width="24"
									height="24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									viewBox="0 0 24 24"
								>
									<rect
										x="4"
										y="8"
										width="16"
										height="10"
										rx="4"
										fill="#fff"
										stroke="#181818"
									/>
									<rect
										x="8"
										y="4"
										width="8"
										height="6"
										rx="2"
										fill="#fff"
										stroke="#181818"
									/>
									<circle cx="9" cy="13" r="1" fill="#181818" />
									<circle cx="15" cy="13" r="1" fill="#181818" />
									<path
										d="M12 2v2"
										stroke="#181818"
										strokeLinecap="round"
									/>
									<path
										d="M4 12H2"
										stroke="#181818"
										strokeLinecap="round"
									/>
									<path
										d="M22 12h-2"
										stroke="#181818"
										strokeLinecap="round"
									/>
								</svg>
							</span>
						</button>
					</div>
				</div>
			</section>
			{/* Footer */}
			<footer className="w-full bg-[#111] text-white py-12 px-4 mt-12 relative overflow-hidden">
				<div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-5 relative z-10">
					{/* Left: Logo, tagline, burger image */}
					<div className="flex flex-col justify-between relative ml-4">
						<div className="flex items-center space-x- mb-4">
							<img
								src="/assets/flavorhubicon.png"
								alt="FlavorHUB254 Logo"
								className="h-15 w-15 object-contain"
							/>
							<span className="text-3xl font-bold text-white">
								flavor
								<span style={{ color: "#D32F2F" }}>HUB</span>
								<span style={{ color: "#2E7D32" }}>254</span>
							</span>
						</div>
						<div>
							<div className="text-lg font-semibold mb-2">
								Kenya’s Smart Recipe Library
							</div>
							<img
								src="/assets/burgerfooter.png"
								alt="Burger Stack"
								className="w-40 mt-1 ml-5"
								style={{ transform: "rotate(-22deg)" }}
							/>
						</div>
					</div>
					{/* Center: Quick Links */}
					<div className="flex flex-col ml-15">
						<div className="text-xl font-bold mb-4">Quick Links</div>
						<ul className="space-y-3 text-base">
							<li>
								<Link
									href="/"
									className="hover:text-green-400 transition"
								>
									Home
								</Link>
							</li>
							<li>
								<Link
									href="/browse"
									className="hover:text-green-400 transition"
								>
									Browse Recipes
								</Link>
							</li>
							<li>
								<Link
									href="/ai-recipe"
									className="hover:text-green-400 transition"
								>
									Ask FlavorBot
								</Link>
							</li>
							<li>
								<Link
									href="/contact"
									className="hover:text-green-400 transition"
								>
									Login/ Sign Up
								</Link>
							</li>
						</ul>
					</div>
					{/* Right: Contact, social, herbs image */}
					<div className="flex flex-col items-start justify-between relative w-full">
						<div className="w-full">
							<div className="text-xl font-bold mb-4">Contact</div>
							<div className="flex items-center mb-3">
								<span>
									Email:{" "}
									<a
										href="mailto:hello@flavorhub254.co.ke"
										className="underline hover:text-green-400"
									>
										hello@flavorhub254.co.ke
									</a>
								</span>
							</div>
							<div className="flex space-x-4 mb-4">
								<a
									href="#"
									aria-label="Twitter"
									className="bg-green-700 hover:bg-green-800 rounded-lg p-2 transition"
								>
									<svg
										className="w-7 h-7"
										fill="currentColor"
										viewBox="0 0 24 24"
									>
										<path d="M22.46 6c-.77.35-1.6.58-2.47.69a4.3 4.3 0 001.88-2.37 8.59 8.59 0 01-2.72 1.04A4.28 4.28 0 0016.11 4c-2.37 0-4.29 1.92-4.29 4.29 0 .34.04.67.11.99C7.69 9.13 4.07 7.38 1.64 4.7c-.37.63-.58 1.36-.58 2.14 0 1.48.75 2.78 1.89 3.54-.7-.02-1.36-.21-1.94-.53v.05c0 2.07 1.47 3.8 3.42 4.19-.36.1-.74.16-1.13.16-.28 0-.54-.03-.8-.08.54 1.7 2.12 2.94 3.99 2.97A8.6 8.6 0 012 19.54a12.13 12.13 0 006.56 1.92c7.88 0 12.2-6.53 12.2-12.2 0-.19 0-.38-.01-.57A8.7 8.7 0 0024 4.59a8.51 8.51 0 01-2.54.7z" />
									</svg>
								</a>
								<a
									href="#"
									aria-label="Instagram"
									className="bg-green-700 hover:bg-green-800 rounded-lg p-2 transition"
								>
									<svg
										className="w-7 h-7"
										fill="currentColor"
										viewBox="0 0 24 24"
									>
										<path d="M7.75 2h8.5A5.75 5.75 0 0122 7.75v8.5A5.75 5.75 0 0116.25 22h-8.5A5.75 5.75 0 012 16.25v-8.5A5.75 5.75 0 017.75 2zm0 1.5A4.25 4.25 0 003.5 7.75v8.5A4.25 4.25 0 007.75 20.5h8.5a4.25 4.25 0 004.25-4.25v-8.5A4.25 4.25 0 0016.25 3.5h-8.5zm4.25 3.25a5.25 5.25 0 110 10.5 5.25 5.25 0 010-10.5zm0 1.5a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5zm6.13.88a1.13 1.13 0 11-2.25 0 1.13 1.13 0 012.25 0z" />
									</svg>
								</a>
								<a
									href="#"
									aria-label="Facebook"
									className="bg-green-700 hover:bg-green-800 rounded-lg p-2 transition"
								>
									<svg
										className="w-7 h-7"
										fill="currentColor"
										viewBox="0 0 24 24"
									>
										<path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 5 3.66 9.13 8.44 9.88v-6.99H7.9v-2.89h2.54V9.84c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.45h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.89h-2.34v6.99C18.34 21.13 22 17 22 12z" />
									</svg>
								</a>
							</div>
							<div className="text-sm mt-2 mb-2">
								@2025 flavorHub254. All rights reserved
							</div>
						</div>
					</div>
					<img
						src="/assets/herbsfooter.png"
						alt="Spices and Herbs"
						className="w-55 h-55 object-contain  -mt-2"
						style={{ minWidth: "100px" }}
					/>
				</div>
			</footer>
		</main>
		</>
	);
}

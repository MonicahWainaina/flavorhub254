"use client";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";

const categories = [
	{
		title: "Breakfast",
		img: "/assets/category-breakfast.jpg",
		alt: "Breakfast",
	},
	{
		title: "Kenyan Classics",
		img: "/assets/category-main.jpg",
		alt: "Kenyan Classics",
	},
	{
		title: "Sweet Bakes",
		img: "/assets/sweet-bakes.jpg",
		alt: "Sweet Bakes",
	},
	{
		title: "Fried Favorites",
		img: "/assets/fried-chicken-fries.jpg",
		alt: "Fried Favorites",
	},
	{
		title: "Guilty Pleasures",
		img: "/assets/guiltypleasues.jpg",
		alt: "Guilty Pleasures",
	},
	{
		title: "Breakfast",
		img: "/assets/category-breakfast.jpg",
		alt: "Breakfast",
	},
];

// Sample recipes data (12 items, first 6 real, next 6 unique placeholders)
const recipes = [
	{
		title: "Barbecue wings",
		img: "/assets/barbecue-wings.jpg",
		rating: 5.0,
		time: 35,
	},
	{
		title: "Spaghetti & Meatballs",
		img: "/assets/spaghetti-meatballs.jpg",
		rating: 4.0,
		time: 20,
	},
	{
		title: "Red Velvet",
		img: "/assets/red-velvet.jpg",
		rating: 3.0,
		time: 45,
	},
	{
		title: "Samosas",
		img: "/assets/samosas.jpg",
		rating: 5.0,
		time: 30,
	},
	{
		title: "BlackForest Cake",
		img: "/assets/blackforest-cake.jpg",
		rating: 3.0,
		time: 45,
	},
	{
		title: "Mandazi",
		img: "/assets/mandazi.jpg",
		rating: 3.0,
		time: 20,
	},
	// Second half: unique titles and placeholder images
	{
		title: "Veggie Delight",
		img: "/assets/spaghetti-meatballs.jpg",
		rating: 4.5,
		time: 25,
	},
	{
		title: "Tropical Fruit Tart",
		img: "/assets/spaghetti-meatballs.jpg",
		rating: 4.2,
		time: 40,
	},
	{
		title: "Classic Ugali",
		img: "/assets/spaghetti-meatballs.jpg",
		rating: 4.8,
		time: 15,
	},
	{
		title: "Choco Banana Bread",
		img: "/assets/spaghetti-meatballs.jpg",
		rating: 4.0,
		time: 50,
	},
	{
		title: "Zesty Lemon Pie",
		img: "/assets/spaghetti-meatballs.jpg",
		rating: 3.9,
		time: 35,
	},
	{
		title: "Mango Lassi",
		img:"/assets/spaghetti-meatballs.jpg",
		rating: 4.7,
		time: 10,
	},
];

export default function BrowsePage() {
	const carouselRef = useRef(null);
	const [activeIndex, setActiveIndex] = useState(0);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // NEW

	// Responsive card width (match min-w-[260px] in px)
	const CARD_WIDTH = 260 + 24; // card width + gap (gap-6 = 24px)

	// Scroll to card by index
	const scrollToCard = (idx) => {
		if (carouselRef.current) {
			carouselRef.current.scrollTo({
				left: idx * CARD_WIDTH,
				behavior: "smooth",
			});
		}
	};

	// Handle scroll to update active dot
	const handleScroll = () => {
		if (carouselRef.current) {
			const scrollLeft = carouselRef.current.scrollLeft;
			const idx = Math.round(scrollLeft / CARD_WIDTH);
			setActiveIndex(idx);
		}
	};

	// Attach scroll event
	useEffect(() => {
		const ref = carouselRef.current;
		if (ref) {
			ref.addEventListener("scroll", handleScroll, { passive: true });
			return () => ref.removeEventListener("scroll", handleScroll);
		}
	}, []);

	// Responsive scroll for arrows
	const scroll = (direction) => {
		let newIndex = activeIndex + (direction === "left" ? -1 : 1);
		newIndex = Math.max(0, Math.min(categories.length - 1, newIndex));
		scrollToCard(newIndex);
	};

	// Carousel state for recipes grid
	const [recipePage, setRecipePage] = useState(0);
	const recipesPerPage = 6; // 3x2 grid
	const totalPages = Math.ceil(recipes.length / recipesPerPage);

	const paginatedRecipes = recipes.slice(
		recipePage * recipesPerPage,
		(recipePage + 1) * recipesPerPage
	);

	return (
		<main className="min-h-screen bg-[#181818] px-0 py-0">
			{/* Hero Section */}
			<section className="w-full rounded-none shadow-lg relative">
				{/* Hero Image */}
				<div className="relative w-full h-[320px] sm:h-[440px]">
					<Image
						src="/assets/herofood.png"
						alt="Food"
						fill
						className="object-cover object-top"
						priority
					/>
					{/* Gradient Overlay */}
					<div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black/80">
						{/* Header inside overlay */}
						<div className="flex items-center justify-between px-4 sm:px-12 pt-3 sm:pt-5 bg-black/60 sm:bg-black/12 rounded-b-xl ">
							{/* Logo */}
							<div className="flex items-center gap-2 sm:gap-3">
								<span className="text-2xl sm:text-4xl">
									<img
										src="/assets/flavorhubicon.png"
										alt="Logo"
										className="w-16 h-16 sm:w-24 sm:h-24 object-contain"
									/>
								</span>
								<span className="font-extrabold text-white text-lg sm:text-2xl leading-tight">
									Bro<span className="text-[#E94F37]">wse</span>
									<br />
									Rec<span className="text-[#3CB371]">ipes</span>
								</span>
							</div>
							{/* Hamburger for mobile */}
							<button
								className="sm:hidden text-white text-3xl focus:outline-none"
								onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
								aria-label="Open menu"
							>
								☰
							</button>
							{/* Nav */}
							<nav className="hidden sm:flex  items-center gap-12 text-white font-bold text-xl">
								<a
									href="#"
									className="hover:text-[#3CB371] transition"
								>
									Home
								</a>
								<a
									href="#"
									className="hover:text-[#3CB371] transition"
								>
									AI Recipe generator
								</a>
								<button className="ml-6 bg-[#3CB371] text-white px-7 py-3 rounded-lg font-bold text-lg hover:bg-[#2e8b57] transition">
									login/signup
								</button>
							</nav>
						</div>
						{/* Mobile Menu */}
						{mobileMenuOpen && (
							<div className="sm:hidden bg-[#181818] bg-opacity-70 absolute top-0 left-0 w-full z-50 flex flex-col items-center py-6 gap-4 text-white font-bold text-lg shadow-lg">
								{/* Close Icon */}
								<button
									className="absolute top-4 right-6 text-3xl"
									onClick={() => setMobileMenuOpen(false)}
									aria-label="Close menu"
								>
									×
								</button>
								<a
									href="#"
									className="hover:text-[#3CB371] transition mt-6"
									onClick={() => setMobileMenuOpen(false)}
								>
									Home
								</a>
								<a
									href="#"
									className="hover:text-[#3CB371] transition"
									onClick={() => setMobileMenuOpen(false)}
								>
									AI Recipe generator
								</a>
								<button
									className="bg-[#3CB371] text-white px-7 py-3 rounded-lg font-bold text-lg hover:bg-[#2e8b57] transition"
									onClick={() => setMobileMenuOpen(false)}
								>
									login/signup
								</button>
							</div>
						)}
						{/* Hero Content */}
						<div className="flex flex-col items-center justify-center h-[200px] sm:h-[340px] mt-4 sm:mt-8 px-2">
							<h1 className="text-3xl sm:text-6xl font-extrabold text-white mb-4 sm:mb-8 text-center drop-shadow-2xl">
								Browse & Cook
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
				</div>
			</section>
			{/* Categories Carousel */}
			<section className="w-full mt-7 px-0">
				{/* Centered horizontal line */}
				<div className="flex justify-center mb-4">
					<div className="h-1 w-24 bg-[#3CB371] rounded-full opacity-80"></div>
				</div>
				<h2 className="text-3xl font-extrabold text-white text-center mb-6">
					Categories
				</h2>
				<div className="flex items-center justify-between w-full px-2 sm:px-4">
					{/* Left Arrow */}
					<button
						aria-label="Scroll left"
						onClick={() => scroll("left")}
						className="hidden sm:flex bg-[#3CB371] rounded-full p-3 text-white hover:bg-[#2e8b57] transition"
						style={{ minWidth: 48, minHeight: 48 }}
						disabled={activeIndex === 0}
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
					{/* Carousel */}
					<div
						ref={carouselRef}
						className="flex gap-6 overflow-x-auto scrollbar-hide py-2 w-full snap-x snap-mandatory"
						style={{ scrollBehavior: "smooth" }}
					>
						{categories.map((cat, idx) => (
							<div
								key={cat.title + idx}
								className="bg-[#237a4b] rounded-xl overflow-hidden shadow-md min-w-[80vw] max-w-[80vw] sm:min-w-[260px] sm:max-w-[260px] flex flex-col snap-center transition-all duration-300"
							>
								<div className="bg-[#237a4b] text-center">
									<span className="inline-block text-white px-4 py-1 font-bold text-lg">
										{cat.title}
									</span>
								</div>
								<Image
									src={cat.img}
									alt={cat.alt}
									width={300}
									height={180}
									className="w-full h-44 object-cover"
									style={{
										borderTopLeftRadius: 12,
										borderTopRightRadius: 12,
									}}
								/>
							</div>
						))}
					</div>
					{/* Right Arrow */}
					<button
						aria-label="Scroll right"
						onClick={() => scroll("right")}
						className="hidden sm:flex bg-[#3CB371] rounded-full p-3 text-white hover:bg-[#2e8b57] transition"
						style={{ minWidth: 48, minHeight: 48 }}
						disabled={activeIndex === categories.length - 1}
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
				{/* Pagination Dots */}
				<div className="flex justify-center mt-4 gap-2 sm:hidden">
					{categories.map((_, idx) => (
						<button
							key={idx}
							className={`w-3 h-3 rounded-full transition-all duration-200 ${
								idx === activeIndex
									? "bg-[#3CB371] scale-125"
									: "bg-gray-400 opacity-60"
							}`}
							onClick={() => scrollToCard(idx)}
							aria-label={`Go to category ${idx + 1}`}
						/>
					))}
				</div>
			</section>
			{/* Divider Line for Recipes Section */}
			<div className="flex justify-center my-8">
				<div className="h-1 w-24 bg-[#3CB371] rounded-full opacity-80"></div>
			</div>
			<h2 className="text-3xl font-extrabold text-white text-center mb-6">
				Recipes
			</h2>

			{/* Recipes Section */}
			<section className="w-full px-2 sm:px-8 flex flex-col sm:flex-row gap-8">
				{/* Filter Sidebar */}
				<aside className="sm:w-1/4 w-full bg-[#181818] rounded-xl p-6 shadow-lg flex flex-col gap-6">
					<h3 className="text-xl font-bold text-white mb-2">
						Filter By Ingredients
					</h3>
					<form className="flex flex-col gap-4">
						{/* Vegetables */}
						<div>
							<span className="font-semibold text-white">Vegetables</span>
							<div className="flex flex-col gap-1 mt-1">
								<label className="text-white">
									<input type="checkbox" /> Tomato
								</label>
								<label className="text-white">
									<input type="checkbox" /> Spinach
								</label>
								<label className="text-white">
									<input type="checkbox" /> Kale
								</label>
								<label className="text-white">
									<input type="checkbox" /> Potatoes
								</label>
							</div>
						</div>
						{/* Meats */}
						<div>
							<span className="font-semibold text-white">Meats</span>
							<div className="flex flex-col gap-1 mt-1">
								<label className="text-white">
									<input type="checkbox" /> Chicken
								</label>
								<label className="text-white">
									<input type="checkbox" /> Beef
								</label>
								<label className="text-white">
									<input type="checkbox" /> Goat
								</label>
								<label className="text-white">
									<input type="checkbox" /> Fish
								</label>
							</div>
						</div>
						{/* Dairy */}
						<div>
							<span className="font-semibold text-white">Dairy</span>
							<div className="flex flex-col gap-1 mt-1">
								<label className="text-white">
									<input type="checkbox" /> Eggs
								</label>
								<label className="text-white">
									<input type="checkbox" /> Milk
								</label>
								<label className="text-white">
									<input type="checkbox" /> Cheese
								</label>
							</div>
						</div>
						<button
							type="submit"
							className="mt-4 bg-[#3CB371] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#2e8b57] transition"
						>
							Apply Filter
						</button>
					</form>
				</aside>

				{/* Recipe Cards Grid Carousel */}
				<div className="sm:w-3/4 w-full flex flex-col">
					<div className="flex items-center justify-end mb-4">
						{/* Carousel Arrows */}
						<div className="flex gap-2">
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
					</div>
					{/* Grid of Recipe Cards */}
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
						{paginatedRecipes.map((recipe, idx) => (
							<div key={idx} className="bg-[#a94f4f] rounded-2xl p-4 flex flex-col shadow-lg">
								<div className="flex items-center justify-between mb-2">
									<span className="font-bold text-white">{recipe.title}</span>
									<span className="text-yellow-300 font-bold">
										({recipe.rating.toFixed(1)})
									</span>
								</div>
								<Image
									src={recipe.img}
									alt={recipe.title}
									width={300}
									height={180}
									className="rounded-xl mb-2 object-cover"
								/>
								<div className="flex items-center justify-between">
									<span className="text-white">{recipe.time} mins</span>
									<button className="bg-white rounded-full p-1 text-[#a94f4f] font-bold">
										♡
									</button>
								</div>
								<button className="mt-3 bg-white text-[#a94f4f] px-4 py-2 rounded-lg font-bold">
									View Recipe
								</button>
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
				</div>
			</section>
			{/* Recipes Section End */}
		</main>
	);
}

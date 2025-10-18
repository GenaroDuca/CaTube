function ButtonCarousel({ direction, carouselRef }) {
  const icon = direction === "left" ? "❮" : "❯";
  const label = direction === "left" ? "Previous channels" : "Next channels";

  const handleClick = () => {
    if (!carouselRef.current) return;
    const containerWidth = carouselRef.current.clientWidth;
    const scrollAmount = containerWidth * 1; 
    carouselRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <button className={`carousel-btn ${direction}`} onClick={handleClick} aria-label={label}> {icon} </button>
  );
}

export default ButtonCarousel;

import Title from "../../trendingPageComponents/Title";
import { products } from "../../../assets/data/Data";
import Container from "../../common/Container";
import NewButton from "../../homePageComponents/Button";
import { useModal } from "../../common/modal/ModalContext"

function Store() {
    const { openModal } = useModal();  
    return (
        <>
            <Title title="Your store"></Title>
            <hr></hr>
            <Container className="content">
                <Container className="add-container">
                    <Container className="btn-container">
                        <p>Add new product</p>
                        <NewButton type="button" onClick={() => openModal('addproduct')}><i className="fas fa-plus" ></i></NewButton>
                    </Container>
                </Container>
                <h2>Your products</h2>
                <hr></hr>
                <Container className="products-container">
                    {products.map((product) => (
                        <Container className="product-card" key={product.id}>
                            <img src={product.img} alt={product.name} />
                            <h2>{product.name}</h2>
                            <h3>${product.price}</h3>
                            <p>{product.description}</p>
                            <button type="button" onClick={() => openModal('editproduct')}>
                                <i className="fa-solid fa-pen"></i>
                            </button>
                        </Container>
                    ))}
                </Container>
            </Container>
        </>
    );
}

export default Store;
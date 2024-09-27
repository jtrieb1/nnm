import React from 'react';
import { GatsbyImage, IGatsbyImageData } from 'gatsby-plugin-image';
import {CartItemResult, ItemResult} from './cart';


interface ProductCardProps {
    title: string;
    description: string;
    img_src: IGatsbyImageData;
    price: string;
    currency: string;
}

class ProductCard extends React.Component<ProductCardProps> {
    constructor(props: ProductCardProps) {
        super(props);
    }

    render() {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '10px',
                margin: '10px',
                borderRadius: '10px',
            }}>
                <h2>{this.props.title}</h2>
                <GatsbyImage image={this.props.img_src} alt={this.props.title} />
                <p>{this.props.description}</p>
                <p>{this.props.price} {this.props.currency}</p>
            </div>
        );
    }
}

export default ProductCard;

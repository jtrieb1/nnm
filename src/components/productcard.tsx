import React from 'react';
import { GatsbyImage, IGatsbyImageData } from 'gatsby-plugin-image';
import {ItemResult} from './cart';


interface ProductCardProps {
    nodeID: string;
    shopifyID: string;
    title: string;
    handle: string;
    description: string;
    img_src: IGatsbyImageData;
    price: string;
    currency: string;
}

class ProductCard extends React.Component<ProductCardProps> {
    constructor(props: ProductCardProps) {
        super(props);

        this.result = {
            id: this.props.nodeID,
            title: this.props.title,
            handle: this.props.handle,
            description: this.props.description,
            currency: this.props.currency,
            price: parseFloat(this.props.price),
            shopifyId: this.props.shopifyID,
            quantity: 1
        };
    }

    result: ItemResult;

    render() {
        return (
            <a href={`#`}>
                <h2>{this.props.title}</h2>
                <GatsbyImage image={this.props.img_src} alt={this.props.title} />
                <p>{this.props.description}</p>
                <p>{this.props.price} {this.props.currency}</p>
            </a>
        );
    }
}

export default ProductCard;

import { StaticImage } from "gatsby-plugin-image";
import React from "react";

const Signature: React.FC = () => {
    return (
    <StaticImage
        src="../images/signature.png"
        alt="Signature"
        style={{
            position: "relative",
            bottom: 0,
            right: 0,
            width: "6rem",
            height: "3em"
        }}
        imgStyle={
            {
                objectFit: "fill",
                objectPosition: "right bottom"
            }
        }
        aspectRatio={20 / 7}
        formats={["auto", "webp", "avif"]}
    />
    );
}

export default Signature;
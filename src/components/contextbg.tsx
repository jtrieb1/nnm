import { StaticImage } from 'gatsby-plugin-image';
import React from 'react';

const ContextBg: React.FC<{cutoffpx: number}> = ({ cutoffpx }) => {
    const [show, setShow] = React.useState(false);

    React.useEffect(() => {
        if (window.matchMedia(`(min-width: ${cutoffpx}px)`).matches) {
            setShow(true);
        } else {
            setShow(false);
        }

        window.onresize = () => {
            if (window.matchMedia(`(min-width: ${cutoffpx}px)`).matches) {
                setShow(true);
            } else {
                setShow(false);
            }
        }
    }, [setShow]);

    return (
        <>
        {
            show && <div className='catalog-bg-image-container'>
                <StaticImage src="../images/blue_bg.jpg" alt="Blue Background" imgStyle={{ width: '100%', height: '100%' }} objectFit='cover' />
            </div>
        }
        </>
    );
};

export default ContextBg;
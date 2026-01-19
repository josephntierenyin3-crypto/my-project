import React, { useState } from 'react'
import './Images.css'

import image1 from '../../assets/images1.jpg'
import image2 from '../../assets/images2.jpg'
import image3 from '../../assets/image3.jpg'
import image4 from '../../assets/images4.jpg'
import image5 from '../../assets/images5.jpg'
import image6 from '../../assets/images6.jpg'
import image7 from '../../assets/images7.jpg'
import image8 from '../../assets/images8.jpg'
import image9 from '../../assets/images9.jpg'

const imagesData = [
  { src: image1, text: 'Water Line Repair\nPlumbing' },
  { src: image2, text: 'Basement Plumbing\nPlumbing' },
  { src: image3, text: 'Remodeling Service\nPlumbing' },
  { src: image4, text: 'Water Line Repair\nPlumbing' },
  { src: image5, text: 'Kitchen Plumbing\nPlumbing' },
  { src: image6, text: 'Gas Line Services\nPlumbing' },
  { src: image7, text: 'Basement Plumbing\nPlumbing' },
  { src: image8, text: 'Water Line Repair\nPlumbing' },
  { src: image9, text: 'Remodeling Service\nPlumbing' },
]

const Images = () => {
  const [showMore, setShowMore] = useState(false)

  return (
    <div className="images-wrapper">
      {/* Images grid */}
      <div className="images-section">
        {imagesData.slice(0, 6).map((img, index) => (
          <div className="image-container" key={index}>
            <img src={img.src} alt={`Image ${index + 1}`} />
            <div className="overlay">
              <span>{img.text}</span>
            </div>
          </div>
        ))}

        {showMore &&
          imagesData.slice(6).map((img, index) => (
            <div className="image-container" key={index + 6}>
              <img src={img.src} alt={`Image ${index + 7}`} />
              <div className="overlay">
                <span>{img.text}</span>
              </div>
            </div>
          ))}
      </div>

      {/* View more button */}
      <div className="view-more">
        <button onClick={() => setShowMore(!showMore)}>
          {showMore ? 'Hide Images' : 'View More'}
        </button>
      </div>
    </div>
  )
}

export default Images

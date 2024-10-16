import React, { useState } from 'react';

interface GridImageProps {
  images: string[];
  hideOverlay?: boolean;
  renderOverlay?: () => string;
  overlayBackgroundColor?: string;
  onClickEach?: (data: { src: string; index: number }) => void;
  countFrom?: number;
}

const GridImage: React.FC<GridImageProps> = ({
  images = [],
  hideOverlay = false,
  renderOverlay = () => 'Preview Image',
  overlayBackgroundColor = '#222222',
  onClickEach = null,
  countFrom = 5,
}) => {
  const [modal, setModal] = useState(false);
  const [url, setUrl] = useState<string | undefined>();
  const [index, setIndex] = useState<number | undefined>();
  const [localCountFrom] = useState(countFrom > 0 && countFrom < 5 ? countFrom : 5);

  if (countFrom <= 0 || countFrom > 5) {
    console.warn('countFrom is limited to 5!');
  }

  const openModal = (index: number) => {
    if (onClickEach) {
      return onClickEach({ src: images[index], index });
    }
    setModal(true);
    setUrl(images[index]);
    setIndex(index);
  };

  const onClose = () => {
    setModal(false);
  };

  const renderOne = () => {
    const overlay = images.length > 1 ? renderCountOverlay() : renderOverlayComponent();

    return (
      <div className="grid grid-cols-1">
        <div className="relative border h-64">
          <img
            src={images[0]}
            alt="preview"
            className="w-full h-full object-cover"
            onClick={() => openModal(0)}
          />
          {overlay}
        </div>
      </div>
    );
  };

  const renderTwo = () => {
    const overlay = images.length > 2 ? renderCountOverlay() : renderOverlayComponent();

    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="relative border h-64">
          <img
            src={images[0]}
            alt="preview"
            className="w-full h-full object-cover"
            onClick={() => openModal(0)}
          />
          {renderOverlayComponent()}
        </div>
        <div className="relative border h-64">
          <img
            src={images[1]}
            alt="preview"
            className="w-full h-full object-cover"
            onClick={() => openModal(1)}
          />
          {overlay}
        </div>
      </div>
    );
  };

  const renderThree = () => (
    <div className="grid grid-cols-3 gap-4">
      {images.slice(0, 3).map((image, index) => (
        <div key={index} className="relative border h-64">
          <img
            src={image}
            alt="preview"
            className="w-full h-full object-cover"
            onClick={() => openModal(index)}
          />
          {renderOverlayComponent(index)}
        </div>
      ))}
    </div>
  );

  const renderOverlayComponent = (id?: number) => {
    if (hideOverlay) return null;

    return (
      <div
        key={`overlay-${id}`}
        className="absolute inset-0 flex items-center justify-center bg-opacity-50 text-white"
        style={{ backgroundColor: overlayBackgroundColor }}
      >
        <div className="text-center">{renderOverlay && renderOverlay()}</div>
      </div>
    );
  };

  const renderCountOverlay = () => {
    const extra = images.length - localCountFrom;

    return (
      <div className="absolute inset-0 flex items-center justify-center bg-opacity-50 bg-black text-white">
        <span className="text-xl">+{extra}</span>
      </div>
    );
  };

  return (
    <div className="grid-container">
      {images.length === 1 && renderOne()}
      {images.length === 2 && renderTwo()}
      {images.length >= 3 && renderThree()}

      {/* {modal && (
        <ModalComponent
          images={images}
          index={index!}
          onClose={onClose}
        />
      )} */}
    </div>
  );
};

export default GridImage;

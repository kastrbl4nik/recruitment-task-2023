import React, { createContext, useContext, useEffect, useLayoutEffect, useState } from "react";
import { 
  Color,
  ElementsType,
  TextTile as ITextTile,
  VerticalSplitter as IVerticalSplitter,
  HorizontalSplitter as IHorizontalSplitter,
  ImageTile as IImageTile,
  ButtonTile as IButtonTile,
} from "../model";

const ColorCode = new Map<Color, string>([
  ['dark', '#1b1c2e'],
  ['mid', '#242538'],   
  ['light', '#f0f0f5'],
]); // maps color codes to their shorthand names

const LayoutContext = createContext<{ 
  elements: ElementsType[]; 
  updateElement: (element: ElementsType) => void;
  addElement: (element: ElementsType) => void
} | undefined>(undefined);

export function Layout({ rootElement }: {rootElement?: ElementsType}) {
  const [elements, setElements] = useState<ElementsType[]>([]);

  function updateElement(element: ElementsType) {
    setElements(prevElements =>
      prevElements.map(prevElement =>
        prevElement.elementKey === element.elementKey ? element : prevElement
      )
    );
  }

  function addElement(element: ElementsType) {
    setElements(prevElements => [...prevElements, element]);
  }

  return (
    <LayoutContext.Provider value={{ elements, updateElement, addElement }}>
      {rootElement ? <Tile defaultElement={rootElement}/> : ''}
    </LayoutContext.Provider>
  );
}
  
export function Tile({ defaultElement }: {defaultElement?: ElementsType}) {
  const layout = useContext(LayoutContext);
  const [element, setElement] = useState(defaultElement);

  useEffect(() => {
    const updatedElement = layout?.elements.find(el => el.elementKey == element?.elementKey);
    if(updatedElement)
      setElement(updatedElement)
  }, [layout]) // reacts to the changes in layout in ButtonTile

  useEffect(() => {
    let layoutElement = layout?.elements.find(el => el.elementKey == element?.elementKey);
    if(!layoutElement && element)
      layout?.addElement(element);
  }, []) // adds this tile to the layout context on the first render

  switch (element?.type) {
    case 'textTile':
      return <TextTile title={element.title} text={element.text} color={element.color} elementKey={element.elementKey} />;
    case 'imageTile':
      return <ImageTile source={element.source} title={element.title} elementKey={element.elementKey} />;
    case 'buttonTile':
      return <ButtonTile text={element.text} action={element.action} elementKey={element.elementKey} />;
    case 'horizontalSplitter':
      return <HorizontalSplitter elements={element.elements} elementKey={element.elementKey} />;
    case 'verticalSplitter':
      return <VerticalSplitter elements={element.elements} elementKey={element.elementKey} />;
    default:
      return null;
  }
}

export function TextTile(element: Omit<ITextTile, "type">) {
  return (
    <div className="tile" style={{ 
      backgroundColor: ColorCode.get(element.color ?? 'dark'),
      padding: "10px"
    }}>
      {element.title && <h3>{element.title}</h3>}
      {element.text && <p>{element.text}</p>}
    </div>
  );
}

export function VerticalSplitter(element: Omit<IVerticalSplitter, "type">) {
  return (
    <div className="verticalSplitter tile">
      {element.elements?.map((child) => {
        return (
          <Tile defaultElement={child} key={child.elementKey}/>
        );
      })}
    </div>
  );
}

export function HorizontalSplitter(element: Omit<IHorizontalSplitter, "type">) {
  return (
    <div className="horizontalSplitter tile">
      {element.elements?.map((child) => {
        return (
          <Tile defaultElement={child} key={child.elementKey}/>
        );
      })}
    </div>
  );
}

export function ImageTile(image: Omit<IImageTile, "type">) {
  return (
    <img className="tile" src={image.source} alt={image.title}/>
  );
}

export function ButtonTile(button: Omit<IButtonTile, "type">) {
  const layout = useContext(LayoutContext);
  const handleClick = () => {
    if (button.action.type === 'update') {
      let updatedElement = {
        ...layout?.elements.find(el => el.elementKey == button.action.referenceElementKey),
        ...button.action.value
      } // overrides values in the element with the new ones
      layout?.updateElement(updatedElement as ElementsType);
    }
  };

  return (
    <button className="tile" onClick={() => handleClick()}>
      {button.text}
    </button>
  )
}
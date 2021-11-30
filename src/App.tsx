import styled from "@emotion/styled";
import faker from "faker";
import React, { forwardRef, useEffect, useRef, useState } from "react";
import { ListChildComponentProps, VariableSizeList } from "react-window";

/** Data generation */
const getPersons = () =>
  new Array(Math.round(Math.random() * 5))
    .fill(true)
    .map(() => `${faker.name.lastName()}, ${faker.name.firstName()}`);

const data = new Array(100).fill(true).map(() => ({
  state: faker.datatype.boolean(),
  name: faker.company.companyName(),
  persons: getPersons(),
}));
/** End data generation */

/** What is passed to row itemData */
interface ListChildProps {
  items: typeof data;
}

/** Extending react-window interface for index and style */
interface RenderRowProps extends ListChildComponentProps {
  data: ListChildProps;
}

/** Mock my customers table row component */
const RenderRow = ({ index, style, data: { items } }: RenderRowProps) => {
  const { state, name, persons } = items[index];

  return (
    <Row key={index} cols="6ch 35ch 1fr" style={{ ...style }}>
      <Col cols="1 / 2" rows="1 / 2" tabIndex={0}>
        {state ? "ON" : "OFF"}
      </Col>
      <Col cols="2 / 3" rows="1 / 2" smCols="2 / 4">
        {name}
      </Col>
      {persons.length > 0 && (
        <Col
          className="muted"
          cols="3 / 4"
          rows="1 / 2"
          smCols="2 / 4"
          smRows="2 / 3"
        >
          {persons.join(", ")}
        </Col>
      )}
    </Row>
  );
};

/** Adding focusing for keyboard scrolling to the outer list element */
const Outer = forwardRef((props, ref: React.Ref<HTMLDivElement>) => {
  return <div tabIndex={0} ref={ref} {...props}></div>;
});

const App = () => {
  /** We get the row size recalcualation function from the ref */
  const listRef = useRef<VariableSizeList<ListChildProps>>(null);
  /** Keep track of the current breanpoint here, since we can't rely on css media queries */
  const [mobileBreakpoint, setMobileBreakpoint] = useState(
    window.innerWidth >= 768
  );

  /** Row height calculation */
  const getRowHeight = () => {
    if (window.innerWidth >= 768) return 32;
    return 64;
  };

  /** Loop through all the rows we have and update the cached row height values */
  const sizeRecalculationHandler = () => {
    for (let i = 0; i < data.length; i++) {
      listRef.current?.resetAfterIndex(i);
    }
  };

  /** Update breakpoint state */
  const windowResizeHandler = () => {
    if (window.innerWidth >= 768) {
      setMobileBreakpoint(false);
      return;
    }
    setMobileBreakpoint(true);
  };

  /** Call recalculation on breakpoint change */
  useEffect(() => {
    sizeRecalculationHandler();
  }, [mobileBreakpoint]);

  /** Call breakpoint update on window resize */
  useEffect(() => {
    window.addEventListener("resize", windowResizeHandler);
    return () => window.removeEventListener("resize", windowResizeHandler);
  }, []);

  return (
    <VariableSizeList
      height={400}
      itemCount={data.length}
      itemData={{
        items: data,
      }}
      itemSize={getRowHeight}
      outerElementType={Outer}
      ref={listRef}
      width="100%"
    >
      {RenderRow}
    </VariableSizeList>
  );
};

export default App;

const Row = styled.div<{ cols: string }>`
  display: grid;
  grid-template-columns: ${({ cols }) => cols};
  grid-auto-rows: auto;
`;

const Col = styled.div<{
  cols: string;
  rows: string;
  smCols?: string;
  smRows?: string;
}>`
  padding: 8px;
  grid-column: ${({ cols }) => cols};
  grid-row: ${({ rows }) => rows};
  font-family: sans-serif;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media (max-width: 768px) {
    grid-column: ${({ smCols }) => smCols};
    grid-row: ${({ smRows }) => smRows};
  }

  &.muted {
    color: gray;
  }
`;

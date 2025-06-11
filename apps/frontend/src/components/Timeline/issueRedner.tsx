export const itemRender = ({
  item,
  itemContext,
  getItemProps,
  getResizeProps,
}: any) => {
  const { left: itemLeft, width: itemWidth } = itemContext.dimensions;
  const backgroundColor = itemContext.selected
    ? itemContext.dragging
      ? 'red'
      : item.selectedBgColor
    : '#4e75d8';

  const borderColor = itemContext.resizing ? 'red' : item.color;
  const getRelativePosition = (timestamp: number): number => {
    const taskDuration = item.end_time.valueOf() - item.start_time.valueOf();
    const offset = timestamp - item.start_time.valueOf();
    return (offset / taskDuration) * itemWidth;
  };

  const createdAtX = getRelativePosition(item.createdAt.valueOf());
  const inProgressX = getRelativePosition(item.inProgress.valueOf());

  return (
    <div
      {...getItemProps({
        style: {
          backgroundColor,
          color: '#ffffff',
          zIndex: 100,
          borderColor,
          border: itemContext.selected ? 'dashed 1px rgba(0,0,0,0.3)' : 'none',
          borderRadius: 4,
          boxShadow: `0 1px 5px 0 rgba(0, 0, 0, 0.2),
                   0 2px 2px 0 rgba(0, 0, 0, 0.14),
                   0 3px 1px -2px rgba(0, 0, 0, 0.12)`,
        },
        onMouseDown: () => {
          console.log('on item click', item);
        },
      })}
    >
      <div
        style={{
          height: itemContext.dimensions.height,
          overflow: 'hidden',
          paddingLeft: 3,
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontSize: '1rem',
          marginLeft: '1rem',
        }}
      >
        {item.title}
      </div>

      {/* Marker: createdAt */}
      <div
        style={{
          position: 'absolute',
          left: `${createdAtX}px`,
          top: 0,
          bottom: 0,
          width: 2,
          backgroundColor: 'yellow',
        }}
        title="createdAt"
      ></div>

      {/* Marker: inProgress */}
      <div
        style={{
          position: 'absolute',
          left: `${inProgressX}px`,
          top: 0,
          bottom: 0,
          width: 2,
          backgroundColor: 'orange',
        }}
        title="inProgress"
      ></div>
    </div>
  );
};

import randomColor from 'randomcolor';

export const generateSingleGraphDataset = (
  stats: Record<string, Record<string, any>>
) => {
  return (
    Object.entries(stats || {})?.map(([userstat, stats]) => {
      const color = randomColor();

      return {
        label: userstat,
        data: stats ? Object.values(stats) : [],
        backgroundColor: color,
        borderColor: color,
      };
    }) || []
  );
};

export const generateTeamSingleGraphDataset = (
  stats: Record<string, number>
) => {
  const color = randomColor();

  return [
    {
      label: 'entire team',
      data: Object.values(stats),
      backgroundColor: color,
      borderColor: color,
    },
  ];
};

export const generateMultipleGraphDataset = (
  stats: Record<string, Record<string, any>>,
  currentSprint: string
) => {
  const labels = Object.keys(stats);

  const statusSet = new Set();
  labels.forEach((user) => {
    const sprintData = stats[user][currentSprint];
    if (sprintData) {
      Object.keys(sprintData).forEach((status) => statusSet.add(status));
    }
  });

  const statuses = Array.from(statusSet);

  return statuses.map((status) => {
    return {
      label: status,
      data: labels.map((user) => {
        const sprintData = stats[user][currentSprint];
        //@ts-ignore
        return sprintData && sprintData[status] ? sprintData[status] : 0;
      }),
      backgroundColor: randomColor(),
    };
  });
};

export const generateTeamMultipleGraphDataset = (
  stats: Record<string, Record<string, any>>
) => {
  const labels = Object.keys(stats);

  const statusSet = new Set();
  labels.forEach((label) => {
    const sprintData = stats[label];
    if (sprintData) {
      Object.keys(sprintData).forEach((status) => statusSet.add(status));
    }
  });

  const statuses = Array.from(statusSet);

  return statuses.map((status) => {
    return {
      label: status,
      data: labels.map((label) => {
        const sprintData = stats[label];
        //@ts-ignore
        return sprintData && sprintData[status] ? sprintData[status] : 0;
      }),
      backgroundColor: randomColor(),
    };
  });
};

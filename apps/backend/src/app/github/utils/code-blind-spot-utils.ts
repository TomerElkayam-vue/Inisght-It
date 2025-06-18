interface ChangePoint {
  user: string;
  points: number;
}

interface PathPoints {
  contributedUsers: Record<string, number>;
}

interface Difference {
  key: string;
  diff: number;
  topUser: string;
}

export const calculatePointsPerPRChange = (change: any) => {
  const allDirectories = change.filename.split('/');
  const relevantDirectories = allDirectories.slice(
    0,
    allDirectories.length - 2
  );
  const changePoints: Record<string, ChangePoint> = {};
  let currentPath = '';

  relevantDirectories.forEach((directory: string) => {
    currentPath += `${directory}`;

    changePoints[currentPath] = {
      user: change.user,
      points: change.changes / 20,
    };
    currentPath += '/';
  });
  return changePoints;
};

export const sumPRChangesPoints = (
  PRChanges: any[]
): Record<string, PathPoints> => {
  const pathPerPoints: Record<string, PathPoints> = {};

  PRChanges.forEach((change: any) => {
    const currentChangePoints = calculatePointsPerPRChange(change);
    Object.entries(currentChangePoints).forEach(([key, value]) => {
      if (!pathPerPoints[key]) {
        pathPerPoints[key] = {
          contributedUsers: {
            [value.user]: value.points,
          },
        };
      } else {
        pathPerPoints[key].contributedUsers[value.user] = pathPerPoints[key]
          .contributedUsers[value.user]
          ? pathPerPoints[key].contributedUsers[value.user] + value.points
          : value.points;
      }
    });
  });

  return pathPerPoints;
};

export const getTopBlindSpotsInCode = (
  data: Record<string, PathPoints>,
  amount: number
): Record<string, string> => {
  const differences: Difference[] = [];

  for (const key in data) {
    const users = data[key].contributedUsers;
    const entries: [string, number][] = Object.entries(users).map(
      ([user, points]) => [user, Number(points)]
    );

    // Skip if more than 3 users
    if (entries.length === 0 || entries.length > 3) continue;

    // Sort users by points descending
    entries.sort((a, b) => b[1] - a[1]);

    const [topUser, topPoints] = entries[0];
    const secondPoints = entries[1]?.[1] || 0;
    const diff = topPoints - secondPoints;

    differences.push({ key, diff, topUser });
  }

  const sorted = differences
    .slice()
    .sort((a, b) => b.diff - a.diff || a.key.length - b.key.length);

  const selected: Difference[] = [];
  let i = 0;

  while (i < sorted.length && selected.length < amount) {
    const item = sorted[i];
    if (
      !selected.some(
        (s) => item.key.startsWith(s.key + '/') || item.key === s.key
      )
    ) {
      selected.push(item);
    }
    i++;
  }

  return selected.reduce((acc, item) => {
    acc[item.key] = item.topUser;
    return acc;
  }, {} as Record<string, string>);
};

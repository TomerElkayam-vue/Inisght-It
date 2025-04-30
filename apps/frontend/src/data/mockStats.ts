export const sprintProgressData = {
  labels: ["Sprint 1", "Sprint 2", "Sprint 3", "Sprint 4", "Sprint 5"],
  datasets: [
    {
      label: "Tasks Completed",
      data: [15, 18, 16, 14, 12],
      borderColor: "#8b5cf6",
      tension: 0.4,
    },
  ],
};

export const taskDistributionData = {
  labels: ["רוני", "תומר", "ניצן", "נטע", "עידו", "שיר"],
  datasets: [
    {
      label: "Sprint 1",
      data: [24, 12, 20, 18, 14, 22],
      backgroundColor: "#67e8f9",
    },
    {
      label: "Sprint 2",
      data: [22, 14, 18, 16, 12, 20],
      backgroundColor: "#8b5cf6",
    },
    {
      label: "Sprint 3",
      data: [20, 16, 16, 14, 10, 18],
      backgroundColor: "#ec4899",
    },
  ],
};

export const circularStats = {
  backlogTasks: {
    value: 3,
    total: 10,
    label: "כמות באגים בספרינט",
  },
  averageTaskTime: {
    value: 22,
    total: 100,
    label: "כמות שעות ממוצעת למשימה",
  },
  averageSprintTime: {
    value: 51,
    total: 100,
    label: "משך זמן ספרינט ממוצע",
  },
};

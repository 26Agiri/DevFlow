import api from "./api";

export const getWeeklyWorkHistory = async () => {
  const response = await api.get(
    "/work-sessions/history/weekly"
  );

  return response.data;
};

export const getSessionHistoryForWeek = async (
  weekStart
) => {
  const response = await api.get(
    "/work-sessions/history/sessions",
    {
      params: {
        weekStart,
      },
    }
  );

  return response.data;
};
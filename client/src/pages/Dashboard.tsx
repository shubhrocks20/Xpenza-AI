import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  ShoppingCart,
  CreditCard,
  TrendingUp,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/routes/axiosInstance";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

// Register Chart.js components and plugin
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  ChartDataLabels
);

const COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEEAD",
  "#D4A5A5",
  "#9B59B6",
  "#3498DB",
];

const monthMap: any = {
  January: 0,
  February: 1,
  March: 2,
  April: 3,
  May: 4,
  June: 5,
  July: 6,
  August: 7,
  September: 8,
  October: 9,
  November: 10,
  December: 11,
};

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const currentYear = new Date().getFullYear();

const fetchBillsData = async (filters: {
  from?: string;
  to?: string;
  categories?: string[];
  limit?: number;
}) => {
  const response = await axiosInstance.get("/bills", { params: filters });
  return response.data.data;
};

const fetchBudgetData = async () => {
  const response = await axiosInstance.get("/bills/budgets");
  return response.data.data;
};

const createBudgetData = async (budget: {
  totalBudget: number;
  spent: number;
}) => {
  const response = await axiosInstance.post("/bills/budgets", budget);
  return response.data.data;
};

const updateBudgetData = async (budget: {
  totalBudget: number;
  spent: number;
}) => {
  const response = await axiosInstance.put("/bills/budgets", budget);
  return response.data.data;
};

const fetchGoalsData = async () => {
  const response = await axiosInstance.get("/bills/financial-goals");
  return response.data.data;
};

const createGoalData = async (goal: {
  name: string;
  target: number;
  saved: number;
}) => {
  const response = await axiosInstance.post("/bills/financial-goals", goal);
  return response.data.data;
};

const updateGoalData = async (goal: {
  id: number;
  target: number;
  saved: number;
}) => {
  const response = await axiosInstance.put(
    `/bills/financial-goals/${goal.id}`,
    goal
  );
  return response.data.data;
};

const constructFilters = (period: string, month: string, category: string) => {
  let from, to;
  if (period === "Monthly") {
    const monthIndex = monthMap[month];
    from = `${currentYear}-${String(monthIndex + 1).padStart(2, "0")}-01`;
    to = new Date(currentYear, monthIndex + 1, 0).toISOString().split("T")[0];
  } else {
    from = `${currentYear}-01-01`;
    to = `${currentYear}-12-31`;
  }
  const filters: any = { from, to, limit: 0 };
  if (category !== "All") {
    filters.categories = [category];
  }
  return filters;
};

const Dashboard = () => {
  const [selectedMonth, setSelectedMonth] = useState("January");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPeriod, setSelectedPeriod] = useState("Monthly");
  const [newBudget, setNewBudget] = useState({ totalBudget: 0, spent: 0 });
  const [newGoal, setNewGoal] = useState({ name: "", target: 0, saved: 0 });
  const [budgetErrorMsg, setBudgetErrorMsg] = useState("");
  const [goalErrorMsg, setGoalErrorMsg] = useState("");

  const queryClient = useQueryClient();
  const barChartRef = useRef<any>(null);

  const { data: monthlyTotals, isLoading: monthlyLoading } = useQuery({
    queryKey: ["monthlyTotals", currentYear],
    queryFn: async () => {
      const totals = await Promise.all(
        monthNames.map((name, i) => {
          const from = `${currentYear}-${String(i + 1).padStart(2, "0")}-01`;
          const to = new Date(currentYear, i + 1, 0)
            .toISOString()
            .split("T")[0];
          return fetchBillsData({ from, to, limit: 0 }).then((data) => ({
            name,
            value: data.totalSpend || 0,
          }));
        })
      );
      return totals;
    },
  });

  const {
    data: billsData,
    refetch,
    isLoading: billsLoading,
  } = useQuery({
    queryKey: ["bills", selectedPeriod, selectedMonth, selectedCategory],
    queryFn: () => {
      const filters = constructFilters(
        selectedPeriod,
        selectedMonth,
        selectedCategory
      );
      return fetchBillsData(filters);
    },
    enabled: false,
  });

  const {
    data: budgetData,
    isLoading: budgetLoading,
    error: budgetError,
  } = useQuery({
    queryKey: ["budget"],
    queryFn: fetchBudgetData,
  });

  const {
    data: goalsData,
    isLoading: goalsLoading,
    error: goalsError,
  } = useQuery({
    queryKey: ["financialGoals"],
    queryFn: fetchGoalsData,
  });

  const budgetCreateMutation = useMutation({
    mutationFn: createBudgetData,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budget"] });
      setBudgetErrorMsg("");
    },
    onError: (error: any) => {
      setBudgetErrorMsg(
        error.response?.data?.message || "Failed to create budget"
      );
    },
  });

  const budgetUpdateMutation = useMutation({
    mutationFn: updateBudgetData,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budget"] });
    },
    onError: (error: any) => {
      setBudgetErrorMsg(
        error.response?.data?.message || "Failed to update budget"
      );
    },
  });

  const goalCreateMutation = useMutation({
    mutationFn: createGoalData,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financialGoals"] });
      setNewGoal({ name: "", target: 0, saved: 0 });
      setGoalErrorMsg("");
    },
    onError: (error: any) => {
      setGoalErrorMsg(error.response?.data?.message || "Failed to create goal");
    },
  });

  const goalUpdateMutation = useMutation({
    mutationFn: updateGoalData,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financialGoals"] });
    },
    onError: (error: any) => {
      setGoalErrorMsg(error.response?.data?.message || "Failed to update goal");
    },
  });

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = Number(value);
    if (numValue < 0) {
      setBudgetErrorMsg(`${name} cannot be negative`);
      return;
    }
    budgetUpdateMutation.mutate({
      ...budgetData,
      [name]: numValue,
    });
  };

  const handleNewBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = Number(value);
    if (numValue < 0) {
      setBudgetErrorMsg(`${name} cannot be negative`);
      return;
    }
    setNewBudget((prev) => ({ ...prev, [name]: numValue }));
    setBudgetErrorMsg("");
  };

  const handleCreateBudget = () => {
    if (newBudget.totalBudget < newBudget.spent) {
      setBudgetErrorMsg("Spent cannot exceed total budget");
      return;
    }
    budgetCreateMutation.mutate(newBudget);
  };

  const handleGoalChange = (
    id: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    const numValue = Number(value);
    if (numValue < 0) {
      setGoalErrorMsg(`${name} cannot be negative`);
      return;
    }
    goalUpdateMutation.mutate({
      id,
      ...goalsData.find((g: any) => g.id === id),
      [name]: numValue,
    });
  };

  const handleNewGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "name" && value.trim() === "") {
      setGoalErrorMsg("Goal name cannot be empty");
      return;
    }
    if (name !== "name" && Number(value) < 0) {
      setGoalErrorMsg(`${name} cannot be negative`);
      return;
    }
    setNewGoal((prev) => ({
      ...prev,
      [name]: name === "name" ? value : Number(value),
    }));
    setGoalErrorMsg("");
  };

  const handleCreateGoal = () => {
    if (newGoal.name.trim() === "") {
      setGoalErrorMsg("Goal name cannot be empty");
      return;
    }
    if (newGoal.saved > newGoal.target) {
      setGoalErrorMsg("Saved amount cannot exceed target");
      return;
    }
    goalCreateMutation.mutate(newGoal);
  };

  const getSpendingTrend = () => {
    if (selectedPeriod === "Yearly" || !monthlyTotals || monthlyLoading) {
      return "N/A";
    }
    const monthIndex = monthMap[selectedMonth];
    const currentTotal = monthlyTotals[monthIndex]?.value || 0;
    const prevTotal =
      monthIndex > 0 ? monthlyTotals[monthIndex - 1]?.value || 0 : 0;
    if (prevTotal === 0) return "N/A";
    const change: any = (
      ((currentTotal - prevTotal) / prevTotal) *
      100
    ).toFixed(2);
    return change > 0
      ? `Increased by ${change}%`
      : `Decreased by ${Math.abs(Number(change))}%`;
  };

  const expenseData =
    billsData?.categoryWiseTotals?.map((item: any) => ({
      name: item.category,
      value: item.totalAmount || 0,
    })) || [];

  // Bar Chart Data
  const barChartData = {
    labels: monthlyTotals?.map((item: any) => item.name) || monthNames,
    datasets: [
      {
        label: "Monthly Expenses",
        data: monthlyTotals?.map((item: any) => item.value) || [],
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, "#FF6B6B");
          gradient.addColorStop(1, "#FF9A8B");
          return gradient;
        },
        borderRadius: 8,
        barThickness: 20,
      },
    ],
  };

  const barChartOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#1F2937",
        titleFont: { size: 14, weight: "bold" },
        bodyFont: { size: 12 },
        padding: 12,
        cornerRadius: 8,
      },
      datalabels: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#6B7280", font: { size: 12 } },
      },
      y: {
        grid: { color: "#E5E7EB" },
        ticks: { color: "#6B7280", font: { size: 12 } },
      },
    },
    animation: {
      duration: 1000,
      easing: "easeOutQuart" as const, // Explicitly use a literal type
    },
  };

  // Pie Chart Data
  const pieChartData = {
    labels: expenseData.map((item: any) => item.name),
    datasets: [
      {
        data: expenseData.map((item: any) => item.value),
        backgroundColor: COLORS,
        borderWidth: 0,
        hoverOffset: 20,
      },
    ],
  };

  const pieChartOptions: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#1F2937",
          font: { size: 12, weight: "bold" },
          padding: 20,
          boxWidth: 12,
        },
      },
      tooltip: {
        backgroundColor: "#1F2937",
        titleFont: { size: 14, weight: "bold" },
        bodyFont: { size: 12 },
        padding: 12,
        cornerRadius: 8,
      },
      datalabels: {
        color: "#1F2937",
        // font: { size: 12, weight: "600" },
        formatter: (value: number, context: any) => {
          const label = context.chart.data.labels[context.dataIndex];
          return `${label}: $${value}`;
        },
        anchor: "end",
        align: "end",
        offset: 10,
        padding: 6,
        clip: false,
        clamp: true,
      },
    },
    animation: {
      duration: 1000,
      easing: "easeOutQuart" as const, // Explicitly use a literal type
    },
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-extrabold mb-8 text-gray-900">
        Expense Tracker Dashboard
      </h1>
      <div className="mb-8 flex flex-wrap gap-4">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="p-3 border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-indigo-500"
        >
          {Object.keys(monthMap).map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="p-3 border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-indigo-500"
        >
          <option value="All">All Categories</option>
          <option value="FOOD">Food</option>
          <option value="TRANSPORT">Transport</option>
          <option value="ENTERTAINMENT">Entertainment</option>
          <option value="SHOPPING">Shopping</option>
          <option value="UTILITIES">Utilities</option>
          <option value="OTHER">Other</option>
          <option value="GROCERY">Grocery</option>
        </select>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="p-3 border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-indigo-500"
        >
          <option value="Monthly">Monthly</option>
          <option value="Yearly">Yearly</option>
        </select>
        <Button
          onClick={() => refetch()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg"
        >
          Fetch Data
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Expenses
            </CardTitle>
            <CreditCard className="w-6 h-6 text-red-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">
              {billsLoading ? "Loading..." : `$${billsData?.totalSpend || 0}`}
            </p>
            <Progress
              value={
                budgetData?.totalBudget
                  ? ((billsData?.totalSpend || 0) / budgetData.totalBudget) *
                    100
                  : 0
              }
              className="mt-2"
            />
          </CardContent>
        </Card>
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Bills Paid
            </CardTitle>
            <ShoppingCart className="w-6 h-6 text-blue-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">
              {billsLoading
                ? "Loading..."
                : billsData?.pagination.totalCount || 0}
            </p>
            <Progress
              value={
                billsData?.pagination.totalCount
                  ? (billsData.pagination.totalCount / 10) * 100
                  : 0
              }
              className="mt-2"
            />
          </CardContent>
        </Card>
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Spending Trend
            </CardTitle>
            <TrendingUp className="w-6 h-6 text-green-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">
              {monthlyLoading || billsLoading
                ? "Loading..."
                : getSpendingTrend()}
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
            <BarChartIcon className="w-6 h-6 text-gray-500 mr-2" /> Monthly
            Expense Overview
          </h2>
          <div className="h-[350px]">
            <Bar
              ref={barChartRef}
              data={barChartData}
              options={barChartOptions}
            />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
            <PieChartIcon className="w-6 h-6 text-gray-500 mr-2" />{" "}
            Category-wise Expenses
          </h2>
          <div className="h-[350px]">
            <Doughnut data={pieChartData} options={pieChartOptions} />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Budget Overview
            </CardTitle>
            <CreditCard className="w-6 h-6 text-yellow-500" />
          </CardHeader>
          <CardContent>
            {budgetLoading ? (
              <p className="text-gray-600">Loading...</p>
            ) : budgetError ? (
              <div>
                <p className="text-red-500 mb-4">No budget set yet</p>
                {budgetErrorMsg && (
                  <p className="text-red-500 mb-4">{budgetErrorMsg}</p>
                )}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Total Budget
                  </label>
                  <Input
                    type="number"
                    name="totalBudget"
                    value={newBudget.totalBudget}
                    onChange={handleNewBudgetChange}
                    className="mt-1 p-2 border rounded-md w-full"
                    min="0"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Spent
                  </label>
                  <Input
                    type="number"
                    name="spent"
                    value={newBudget.spent}
                    onChange={handleNewBudgetChange}
                    className="mt-1 p-2 border rounded-md w-full"
                    min="0"
                  />
                </div>
                <Button
                  onClick={handleCreateBudget}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Create Budget
                </Button>
              </div>
            ) : (
              <>
                {budgetErrorMsg && (
                  <p className="text-red-500 mb-4">{budgetErrorMsg}</p>
                )}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Total Budget
                  </label>
                  <Input
                    type="number"
                    name="totalBudget"
                    value={budgetData?.totalBudget || 0}
                    onChange={handleBudgetChange}
                    className="mt-1 p-2 border rounded-md w-full"
                    min="0"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Spent
                  </label>
                  <Input
                    type="number"
                    name="spent"
                    value={budgetData?.spent || 0}
                    onChange={handleBudgetChange}
                    className="mt-1 p-2 border rounded-md w-full"
                    min="0"
                  />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  ${budgetData?.remaining || 0} remaining
                </p>
                <Progress
                  value={
                    budgetData?.totalBudget
                      ? ((budgetData.remaining || 0) / budgetData.totalBudget) *
                        100
                      : 0
                  }
                  className="mt-2"
                />
              </>
            )}
          </CardContent>
        </Card>
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Financial Goals
            </CardTitle>
            <TrendingUp className="w-6 h-6 text-purple-500" />
          </CardHeader>
          <CardContent>
            {goalsLoading ? (
              <p className="text-gray-600">Loading...</p>
            ) : goalsError || goalsData?.length === 0 ? (
              <p className="text-red-500 mb-4">No financial goals set yet</p>
            ) : (
              goalsData?.map((goal: any) => (
                <div key={goal.id} className="mb-4">
                  <p className="text-lg font-semibold text-gray-800">
                    {goal.name}
                  </p>
                  <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Target
                    </label>
                    <Input
                      type="number"
                      name="target"
                      value={goal.target}
                      onChange={(e) => handleGoalChange(goal.id, e)}
                      className="mt-1 p-2 border rounded-md w-full"
                      min="0"
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Saved
                    </label>
                    <Input
                      type="number"
                      name="saved"
                      value={goal.saved}
                      onChange={(e) => handleGoalChange(goal.id, e)}
                      className="mt-1 p-2 border rounded-md w-full"
                      min="0"
                    />
                  </div>
                  <Progress
                    value={
                      goal.target > 0 ? (goal.saved / goal.target) * 100 : 0
                    }
                    className="mt-2"
                  />
                  <p className="text-sm text-gray-500">
                    ${goal.saved} of ${goal.target}
                  </p>
                </div>
              ))
            )}
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2 text-gray-800">
                Add New Goal
              </h3>
              {goalErrorMsg && (
                <p className="text-red-500 mb-4">{goalErrorMsg}</p>
              )}
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Goal Name
                </label>
                <Input
                  type="text"
                  name="name"
                  value={newGoal.name}
                  onChange={handleNewGoalChange}
                  className="mt-1 p-2 border rounded-md w-full"
                />
              </div>
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Target
                </label>
                <Input
                  type="number"
                  name="target"
                  value={newGoal.target}
                  onChange={handleNewGoalChange}
                  className="mt-1 p-2 border rounded-md w-full"
                  min="0"
                />
              </div>
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Saved
                </label>
                <Input
                  type="number"
                  name="saved"
                  value={newGoal.saved}
                  onChange={handleNewGoalChange}
                  className="mt-1 p-2 border rounded-md w-full"
                  min="0"
                />
              </div>
              <Button
                onClick={handleCreateGoal}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Add Goal
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="mt-6 flex justify-end">
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
          View Detailed Report
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;

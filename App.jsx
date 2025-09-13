import React, { useState } from 'react';
import { PieChart, Pie, Cell } from 'recharts';
const dashboardData = {
  categories: [
    {
      id: "category-1",
      name: "CSPM Executive Dashboard",
      widgets: [
        {
          id: "widget-1",
          name: "Cloud Accounts",
          type: "pie-chart",
          data: [
            { name: "Connected", value: 2, color: '#3863D8' },
            { name: "Not Connected", value: 2, color: '#F0F3F7' },
          ],
          total: 4,
          labels: ["Connected (2)", "Not Connected (2)"]
        },
        {
          id: "widget-2",
          name: "Cloud Account Risk Assessment",
          type: "pie-chart",
          data: [
            { name: "Failed", value: 1089, color: '#D83838' },
            { name: "Warning", value: 68, color: '#FFB800' },
            { name: "Not available", value: 38, color: '#F0F3F7' },
            { name: "Passed", value: 7253, color: '#00B82B' },
          ],
          total: 9659,
          labels: ["Failed (1089)", "Warning (68)", "Not available (38)", "Passed (7253)"]
        },
      ],
    },
    {
      id: "category-2",
      name: "CWPP Dashboard",
      widgets: [
        {
          id: "widget-3",
          name: "Top 5 Namespace Specific Alerts",
          type: "text",
          text: "No Graph data available",
        },
        {
          id: "widget-4",
          name: "Workload Alerts",
          type: "text",
          text: "No Graph data available",
        },
      ],
    },
    {
      id: "category-3",
      name: "Registry Scan",
      widgets: [
        {
          id: "widget-5",
          name: "Image Risk Assessment",
          type: "bar-chart",
          total: 1470,
          data: [
            { name: "Critical", value: 1, color: '#D83838' },
            { name: "High", value: 100, color: '#FFB800' },
          ],
        },
        {
          id: "widget-6",
          name: "Image Security Issues",
          type: "bar-chart",
          total: 2,
          data: [
            { name: "Critical", value: 1, color: '#D83838' },
            { name: "High", value: 1, color: '#FFB800' },
          ],
        },
      ],
    },
  ],
};

const allWidgets = dashboardData.categories.flatMap(cat => cat.widgets.map(w => ({ ...w, categoryId: cat.id })));

const App = () => {
  const [categories, setCategories] = useState(dashboardData.categories);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState(dashboardData.categories[0].id);
  const [checkedWidgets, setCheckedWidgets] = useState([]);

 
  const handleConfirmAddWidgets = () => {
    const widgetsToAdd = allWidgets.filter(widget => checkedWidgets.includes(widget.id));
    const newCategories = JSON.parse(JSON.stringify(categories));

    widgetsToAdd.forEach(widget => {
      const categoryIndex = newCategories.findIndex(cat => cat.id === widget.categoryId);
      if (categoryIndex !== -1) {
        // Prevent adding a widget that is already on the dashboard
        if (!newCategories[categoryIndex].widgets.some(w => w.id === widget.id)) {
          newCategories[categoryIndex].widgets.push(widget);
        }
      }
    });

    setCategories(newCategories);
    setIsModalOpen(false);
    setCheckedWidgets([]);
  };


  const handleRemoveWidget = (categoryId, widgetId) => {
    const updatedCategories = categories.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          widgets: cat.widgets.filter(widget => widget.id !== widgetId),
        };
      }
      return cat;
    });
    setCategories(updatedCategories);
  };

  const handleCheckboxChange = (widgetId) => {
    setCheckedWidgets(prevChecked => {
      if (prevChecked.includes(widgetId)) {
        return prevChecked.filter(id => id !== widgetId);
      } else {
        return [...prevChecked, widgetId];
      }
    });
  };

  
  const filteredCategories = categories.map(category => {
    const widgets = category.widgets.filter(widget =>
      widget.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (widget.text && widget.text.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    return { ...category, widgets };
  });

  const renderWidget = (widget, categoryId) => {
    switch (widget.type) {
      case 'pie-chart':
        const total = widget.total;
        return (
          <div key={widget.id} className="relative bg-white rounded-lg p-4 shadow-sm border border-gray-200 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-4">
            <RemoveButton onRemove={() => handleRemoveWidget(categoryId, widget.id)} />
            <div className="flex flex-col items-center justify-center relative w-24 h-24">
              <PieChart width={96} height={96}>
                <Pie
                  data={widget.data}
                  cx={48}
                  cy={48}
                  innerRadius={30}
                  outerRadius={48}
                  fill="#8884d8"
                  dataKey="value"
                  stroke="none"
                >
                  {widget.data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                <p className="text-xl font-bold text-gray-800">{total}</p>
                <p className="text-[10px] text-gray-500">Total</p>
              </div>
            </div>
            <div className="flex flex-col space-y-1">
              {widget.labels.map((label, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: widget.data[index].color }}></span>
                  <p className="text-xs text-gray-600">{label}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'bar-chart':
        const totalBar = widget.data.reduce((acc, curr) => acc + curr.value, 0);
        return (
          <div key={widget.id} className="relative bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <RemoveButton onRemove={() => handleRemoveWidget(categoryId, widget.id)} />
            <h3 className="text-md font-medium text-gray-900 mb-2">{widget.name}</h3>
            <p className="text-sm text-gray-600 mb-4">{widget.total} total vulnerabilities</p>
            <div className="flex w-full h-3 rounded-full overflow-hidden bg-gray-200 mb-2">
              {widget.data.map((item, index) => (
                <div
                  key={index}
                  className="h-full"
                  style={{ width: `${(item.value / totalBar) * 100}%`, backgroundColor: item.color }}
                ></div>
              ))}
            </div>
            <div className="flex justify-between">
              {widget.data.map((item, index) => (
                <p key={index} className="text-xs text-gray-600">
                  {item.name} ({item.value})
                </p>
              ))}
            </div>
          </div>
        );
      case 'text':
      default:
        return (
          <div key={widget.id} className="relative bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <RemoveButton onRemove={() => handleRemoveWidget(categoryId, widget.id)} />
            <h3 className="text-md font-medium text-gray-900 mb-2">{widget.name}</h3>
            <p className="text-sm text-gray-600">{widget.text}</p>
          </div>
        );
    }
  };

  const RemoveButton = ({ onRemove }) => (
    <button
      onClick={onRemove}
      className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 text-xs font-bold"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  );

  const getWidgetsForTab = (tabId) => {
    const category = dashboardData.categories.find(cat => cat.id === tabId);
    return category ? category.widgets : [];
  };

  return (
    <div className="bg-[#F0F3F7] min-h-screen p-4 md:p-8 font-sans">
      <script src="https://cdn.tailwindcss.com"></script>
      <script src="https://cdn.jsdelivr.net/npm/recharts@2.12.7/umd/Recharts.min.js"></script>
      
      {/* Top Navigation Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white px-6 py-4 rounded-lg shadow-sm mb-6">
        <div className="flex items-center space-x-6">
          <h1 className="text-xl font-bold text-gray-800">Dashboard V2</h1>
          <nav className="hidden md:flex space-x-4 text-gray-600 text-sm">
            <a href="#" className="font-semibold text-blue-600">Home</a>
            <a href="#" className="hover:text-blue-600">CNAPP Dashboard</a>
          </nav>
        </div>
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search anything..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Widget</span>
          </button>
          <button className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 text-sm">Last 2 days</button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="space-y-6">
        {filteredCategories.map(category => (
          <div key={category.id} className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">{category.name}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {category.widgets.map(widget => renderWidget(widget, category.id))}
              {/* Add Widget Button */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-dashed border-gray-300 text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="mt-2 text-sm font-medium">Add Widget</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Widget Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
            <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">Add Widget</h3>
              <button onClick={() => setIsModalOpen(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Personalise your dashboard by adding the following widget
              </p>
              <div className="flex border-b border-gray-200 mb-4">
                {dashboardData.categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedTab(cat.id)}
                    className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${selectedTab === cat.id ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    {cat.name.split(' ')[0]}
                  </button>
                ))}
              </div>
              <div className="space-y-4">
                {getWidgetsForTab(selectedTab).map(widget => (
                  <label key={widget.id} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checkedWidgets.includes(widget.id)}
                      onChange={() => handleCheckboxChange(widget.id)}
                      className="form-checkbox h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-gray-700">{widget.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="bg-gray-100 p-4 flex justify-end space-x-3 border-t border-gray-200">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg text-gray-600 border border-gray-300 hover:bg-gray-200 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAddWidgets}
                className="px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;

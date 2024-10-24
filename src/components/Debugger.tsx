import React, { useState, useEffect } from 'react';

interface DebuggerProps {
  language: string;
  logs: { type: LogType; message: string }[];
}

type LogType = 'Info' | 'Error' | 'Warning';

const Debugger: React.FC<DebuggerProps> = ({ language, logs }) => {
  const [activeTab, setActiveTab] = useState<LogType>('Info');

  useEffect(() => {
    // 当语言改变时，重置活动标签
    setActiveTab('Info');
  }, [language]);

  const filteredLogs = logs.filter(log => log.type === activeTab);

  const TabButton: React.FC<{ type: LogType }> = ({ type }) => (
    <button
      className={`px-3 py-1 text-sm font-medium rounded-t-lg ${
        activeTab === type
          ? 'bg-gray-700 text-white'
          : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
      }`}
      onClick={() => setActiveTab(type)}
    >
      {type}
    </button>
  );

  return (
    <div className="bg-gray-800 text-white p-4 rounded-lg h-[200px] flex flex-col">
      <div className="flex space-x-1 mb-2">
        <TabButton type="Info" />
        <TabButton type="Error" />
        <TabButton type="Warning" />
      </div>
      <div className="flex-grow overflow-hidden bg-gray-900 p-2 rounded">
        <div className="h-full overflow-y-auto">
          {filteredLogs.map((log, index) => (
            <div key={index} className="mb-1">
              {log.message}
            </div>
          ))}
          {filteredLogs.length === 0 && (
            <div className="text-gray-500 italic">暂无{activeTab}日志</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Debugger;

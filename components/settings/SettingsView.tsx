import React from 'react';
import { User, CreditCard, Bell, Shield, Download, Trash2, Home, BookOpen, Crown } from 'lucide-react';

const SettingsView: React.FC = () => {
  return (
    <div className="h-full w-full bg-white flex flex-col overflow-y-auto">
        <div className="max-w-4xl mx-auto w-full p-8">
            <div className="flex items-start gap-6 mb-12">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-sage-100 shadow-lg">
                    <img src="https://picsum.photos/100/100" alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 pt-2">
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        User_123456 <span className="text-sm font-normal text-gray-400">Edit</span>
                    </h1>
                    <p className="text-gray-500 mt-1">ID: 88392019</p>
                    <div className="flex gap-4 mt-4">
                        <span className="text-sm text-gray-500">Phone: Not Bound</span>
                        <span className="text-sm text-gray-500">Email: user@example.com</span>
                    </div>
                     <button className="mt-4 text-sage-600 text-sm hover:underline flex items-center gap-1">
                        <Home size={14} /> Go to official site
                     </button>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-8">
                {/* Sidebar Navigation */}
                <div className="col-span-3">
                    <div className="flex flex-col gap-1">
                        {['My Profile', 'Account Security', 'Premium', 'Notifications', 'General', 'Theme', 'About'].map((item, i) => (
                            <button key={item} className={`text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${i === 2 ? 'bg-sage-50 text-sage-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                                {item}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Area - Simulating the Premium/Membership Page from Screenshot */}
                <div className="col-span-9 bg-white">
                     <div className="bg-gradient-to-r from-sage-50 to-white p-6 rounded-2xl border border-sage-100 mb-8">
                        <div className="flex justify-between items-start">
                             <div>
                                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <Crown size={20} className="text-yellow-500 fill-current" /> Premium Membership
                                </h2>
                                <p className="text-sm text-gray-500 mt-2">Your membership expires: 2031-01-26</p>
                             </div>
                             <button className="text-gray-400 hover:text-gray-600 text-sm">Payment History</button>
                        </div>
                     </div>

                     <div className="grid grid-cols-3 gap-4 mb-8">
                        {[
                            { title: 'Monthly', price: '$3.99', sub: '$2.99/mo' },
                            { title: 'Yearly', price: '$29.99', sub: '$2.49/mo', best: true },
                            { title: 'Lifetime', price: '$199.99', sub: 'One time' }
                        ].map((plan) => (
                            <div key={plan.title} className={`border rounded-xl p-6 flex flex-col items-center cursor-pointer transition-all hover:shadow-md ${plan.best ? 'border-sage-500 bg-sage-50/30 ring-1 ring-sage-500' : 'border-gray-200'}`}>
                                <h3 className="font-medium text-gray-700 mb-2">{plan.title}</h3>
                                <div className="text-2xl font-bold text-sage-700">{plan.price}</div>
                                <div className="text-sm text-gray-400 mt-1">{plan.sub}</div>
                                {plan.best && <span className="mt-3 px-2 py-0.5 bg-sage-500 text-white text-[10px] uppercase font-bold tracking-wider rounded">Best Value</span>}
                            </div>
                        ))}
                     </div>
                     
                     <button className="w-full bg-sage-500 hover:bg-sage-600 text-white py-3 rounded-full font-medium shadow-lg shadow-sage-200 transition-all active:scale-[0.99]">
                        Renew Now
                     </button>

                     <div className="mt-12 border-t border-gray-100 pt-8">
                         <h3 className="text-gray-900 font-medium mb-6">Member Privileges</h3>
                         <div className="grid grid-cols-2 gap-6">
                             <div className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                                 <div className="w-10 h-10 rounded-full bg-sage-200 flex items-center justify-center text-sage-700">
                                     <BookOpen size={20} />
                                 </div>
                                 <div>
                                     <h4 className="font-bold text-gray-800 text-sm">Monthly Calendar View</h4>
                                     <p className="text-xs text-gray-500 mt-1 leading-relaxed">Visualize your monthly plan directly.</p>
                                 </div>
                             </div>
                             <div className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                                 <div className="w-10 h-10 rounded-full bg-sage-200 flex items-center justify-center text-sage-700">
                                     <Bell size={20} />
                                 </div>
                                 <div>
                                     <h4 className="font-bold text-gray-800 text-sm">More Reminders</h4>
                                     <p className="text-xs text-gray-500 mt-1 leading-relaxed">Set up to 5 reminders per task.</p>
                                 </div>
                             </div>
                         </div>
                     </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default SettingsView;
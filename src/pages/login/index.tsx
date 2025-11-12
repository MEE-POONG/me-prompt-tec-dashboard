import React from "react";

export default function Login() {
  return (
    <div className="relative min-h-screen flex items-center bg-linear-to-b  from-blue-600 to-blue-800   text-white">
      <div className="flex-1 h-full absolute inset-0 py-20  px-4 sm:px-6 max-sm:py-50 lg:px-8  ">
        <div className="relative z-10 max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg backdrop-blur-md flex flex-col items-center text-center text-gray-900 ">
          <h2 className="text-2xl font-bold mb-6 text-blue-600">เข้าสู่ระบบ</h2>

          <form className="w-full space-y-8">
            <div>
              <label
                htmlFor="email"
                className="block text-left mb-2 font-medium"
              >
                username
              </label>
              <input
                type="username"
                id="username"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="กรอก username ของคุณ"
                required
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-left mb-2 font-medium"
              >
                password
              </label>
              <input
                type="password"
                id="password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="กรอกรหัสผ่านของคุณ"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span className="ml-2 text-gray-700">จดจำฉัน</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              เข้าสู่ระบบ
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

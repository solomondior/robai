import React from 'react';

interface ContractAddressProps {
  address?: string;
}

export function ContractAddress({ address = "6r2mFkPvp4xo9h5YhWwUHnv5F93NLFgEVT8sMR2pump" }: ContractAddressProps) {
  return (
    <div className="w-full max-w-xl mx-auto my-4">
      <div className="relative">
        <div 
          className="flex items-center w-full rounded-lg border border-gray-700 bg-black bg-opacity-50 backdrop-blur-sm overflow-hidden"
          style={{
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div className="font-mono text-white text-opacity-90 font-medium px-4 py-3">
            CA:
          </div>
          <div 
            className="flex-1 font-mono text-white text-opacity-75 px-2 py-3 truncate"
          >
            {address}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContractAddress; 
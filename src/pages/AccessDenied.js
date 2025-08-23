// src/pages/AccessDenied.js

import React from 'react';
import { Link } from 'react-router-dom';

const AccessDenied = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 text-center">
                <h2 className="text-3xl font-extrabold text-red-600">
                    Acces Nepermis
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                    Nu ai permisiunea de a accesa această pagină.
                </p>
                <div className="mt-6">
                    <Link
                        to="/"
                        className="font-medium text-blue-600 hover:text-blue-500"
                    >
                        Înapoi la pagina principală
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AccessDenied;
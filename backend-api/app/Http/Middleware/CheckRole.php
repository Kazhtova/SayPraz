<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    /**
     * @param string ...$roles
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        if(!Auth::check()){
            return response()->json([
                'success'   => false,
                'message'   => 'Unauthorized: Anda belum login'
            ]);
        }

        $userRole = Auth::user()->role;

        if(!in_array($userRole, $roles)){
            return response()->json([
                'success'   => false,
                'message'   => 'Forbidden: Akses Ditolak. Anda tidak memiliki hak istimewa ini.'
            ], 403);
        }
        return $next($request);
    }
}
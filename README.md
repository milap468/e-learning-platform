      "/users" : [
            "/login",
            "/register",
            "/refresh-token"
        ],
        
        "/user" : [
            {
                "Method" : "GET",
                "Route" : "/profile"
            },
            {
                "Method" : "PUT",
                "Route" : "/profile"
            }
        ],
        
        "/courses" : [
            "/get-courses",
            "/create-course",
            "/update-course/:courseId",
            "/delete-courses/:courseId",
            "/create-category",
            "/course-to-category"
        ],
        
        "/enroll" : [
            "/enroll-to-course",
            "/view-enrolled-courses"
        ]

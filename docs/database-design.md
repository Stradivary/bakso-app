

## **Database Design 💾**
 
erDiagram
    USER_PROFILES {
        uuid id(PK)  "Primary key, references auth.users"
        text role "Role: 'seller' or 'buyer'"
        geometry last_location "Last known location (Point, SRID 4326)"
        timestamptz last_seen "Last active timestamp"
        boolean is_online "Online status"
        timestamptz created_at "Record creation timestamp"
        text name "User's name (max 60 characters)"
        float8 latitude "Latitude of the user"
        float8 longitude "Longitude of the user"
    }

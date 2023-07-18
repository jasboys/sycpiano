export const transformModelToGoogle = ()=>{
// const collaborators = c.collaborators.toArray();
// const pieces = c.pieces.toArray();
// const data: GoogleCalendarParams = {
//     summary: c.name,
//     location: c.location,
//     startDatetime: c.dateTime,
//     endDate: c.endDate ? new Date(c.endDate) : undefined,
//     allDay: c.allDay,
//     timeZone: c.timezone ?? '',
//     description: JSON.stringify({
//         collaborators: collaborators.map(({ name, instrument }) => ({
//             name,
//             instrument,
//         })),
//         pieces: pieces.map(({ composer, piece }) => ({
//             composer,
//             piece,
//         })),
//         type: c.type,
//         website: encodeURI(c.website ?? ''),
//         imageUrl: encodeURI(c.imageUrl ?? ''),
//         placeId: c.placeId,
//         photoReference: c.photoReference,
//     }),
// };
// if (!!c.id) {
//     data.id = c.id;
// }
// return data;
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9nYXBpL2Fub3RoZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNvbnN0IHRyYW5zZm9ybU1vZGVsVG9Hb29nbGUgPSAoKSA9PiB7XG4gICAgLy8gY29uc3QgY29sbGFib3JhdG9ycyA9IGMuY29sbGFib3JhdG9ycy50b0FycmF5KCk7XG4gICAgLy8gY29uc3QgcGllY2VzID0gYy5waWVjZXMudG9BcnJheSgpO1xuICAgIC8vIGNvbnN0IGRhdGE6IEdvb2dsZUNhbGVuZGFyUGFyYW1zID0ge1xuICAgIC8vICAgICBzdW1tYXJ5OiBjLm5hbWUsXG4gICAgLy8gICAgIGxvY2F0aW9uOiBjLmxvY2F0aW9uLFxuICAgIC8vICAgICBzdGFydERhdGV0aW1lOiBjLmRhdGVUaW1lLFxuICAgIC8vICAgICBlbmREYXRlOiBjLmVuZERhdGUgPyBuZXcgRGF0ZShjLmVuZERhdGUpIDogdW5kZWZpbmVkLFxuICAgIC8vICAgICBhbGxEYXk6IGMuYWxsRGF5LFxuICAgIC8vICAgICB0aW1lWm9uZTogYy50aW1lem9uZSA/PyAnJyxcbiAgICAvLyAgICAgZGVzY3JpcHRpb246IEpTT04uc3RyaW5naWZ5KHtcbiAgICAvLyAgICAgICAgIGNvbGxhYm9yYXRvcnM6IGNvbGxhYm9yYXRvcnMubWFwKCh7IG5hbWUsIGluc3RydW1lbnQgfSkgPT4gKHtcbiAgICAvLyAgICAgICAgICAgICBuYW1lLFxuICAgIC8vICAgICAgICAgICAgIGluc3RydW1lbnQsXG4gICAgLy8gICAgICAgICB9KSksXG4gICAgLy8gICAgICAgICBwaWVjZXM6IHBpZWNlcy5tYXAoKHsgY29tcG9zZXIsIHBpZWNlIH0pID0+ICh7XG4gICAgLy8gICAgICAgICAgICAgY29tcG9zZXIsXG4gICAgLy8gICAgICAgICAgICAgcGllY2UsXG4gICAgLy8gICAgICAgICB9KSksXG4gICAgLy8gICAgICAgICB0eXBlOiBjLnR5cGUsXG4gICAgLy8gICAgICAgICB3ZWJzaXRlOiBlbmNvZGVVUkkoYy53ZWJzaXRlID8/ICcnKSxcbiAgICAvLyAgICAgICAgIGltYWdlVXJsOiBlbmNvZGVVUkkoYy5pbWFnZVVybCA/PyAnJyksXG4gICAgLy8gICAgICAgICBwbGFjZUlkOiBjLnBsYWNlSWQsXG4gICAgLy8gICAgICAgICBwaG90b1JlZmVyZW5jZTogYy5waG90b1JlZmVyZW5jZSxcbiAgICAvLyAgICAgfSksXG4gICAgLy8gfTtcbiAgICAvLyBpZiAoISFjLmlkKSB7XG4gICAgLy8gICAgIGRhdGEuaWQgPSBjLmlkO1xuICAgIC8vIH1cbiAgICAvLyByZXR1cm4gZGF0YTtcbn07Il0sIm5hbWVzIjpbInRyYW5zZm9ybU1vZGVsVG9Hb29nbGUiXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sTUFBTUEseUJBQXlCLElBQU07QUFDeEMsbURBQW1EO0FBQ25ELHFDQUFxQztBQUNyQyx1Q0FBdUM7QUFDdkMsdUJBQXVCO0FBQ3ZCLDRCQUE0QjtBQUM1QixpQ0FBaUM7QUFDakMsNERBQTREO0FBQzVELHdCQUF3QjtBQUN4QixrQ0FBa0M7QUFDbEMsb0NBQW9DO0FBQ3BDLHdFQUF3RTtBQUN4RSxvQkFBb0I7QUFDcEIsMEJBQTBCO0FBQzFCLGVBQWU7QUFDZix5REFBeUQ7QUFDekQsd0JBQXdCO0FBQ3hCLHFCQUFxQjtBQUNyQixlQUFlO0FBQ2Ysd0JBQXdCO0FBQ3hCLCtDQUErQztBQUMvQyxpREFBaUQ7QUFDakQsOEJBQThCO0FBQzlCLDRDQUE0QztBQUM1QyxVQUFVO0FBQ1YsS0FBSztBQUNMLGdCQUFnQjtBQUNoQixzQkFBc0I7QUFDdEIsSUFBSTtBQUNKLGVBQWU7QUFDbkIsRUFBRSJ9
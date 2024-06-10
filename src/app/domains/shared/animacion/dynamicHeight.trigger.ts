import { animate, group, query, state, style, transition, trigger } from "@angular/animations";

export const dynamicHeight = trigger('dynamicHeight',[
    state('true',style({
        height: '{{ smartHeight }}px'
    }),{
        params: {smartHeight: 500}
    }),
    state('false',style({
        height: '*'
    })),
    transition('false => true', [
        group([
            animate('0.20s ease-in'),
            query('div',[
                style({
                    height: 0
                }),
                    animate('0.25s ease-in',
                    style({
                        height: '*'
                    }))
            ],{ limit: 1 })
        ])
    ]),
    transition('true => false', [
        group([
            animate('0.20s ease-out'),
            query('div',[
                    animate('0.25s ease-out',
                    style({
                        height: 0
                    }))
            ], { limit: 1 })
        ])
    ])
])

// export const dynamicAppearance = trigger('dynamicAppearance', [
//     transition(':enter',[
//         style({
//             height: 0
//         }),
//         animate('0.25s ease-in',
//         style({
//             height: '*'
//         }))
//     ]),
//     transition(':leave', [
//         animate('0.15s ease-out',
//         style({
//             height: 0
//         }))
//     ])
// ])
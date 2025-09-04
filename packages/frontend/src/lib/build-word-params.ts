export const buildWordParams = (props: {
    type: { id: number; end: string };
    format: string;
    categories: { id: number; value: string }[];
}) => ({
    format: props.format,
    typeId: props.type.id,
    type: props.type.end == '' ? '0' : props.type.end,
    categories: props.categories.flatMap((c) => [c.id.toString(), c.value]),
});

import type { Meta, StoryObj } from '@storybook/react';
import { BusquedaCriteriosForm } from './BusquedaCriteriosForm';
import { expect, screen, within, userEvent } from 'storybook/test';

const meta = {
  title: 'DireccionesFiscales/BusquedaCriteriosForm',
  component: BusquedaCriteriosForm,
  parameters: { layout: 'centered' },
  argTypes: {
    onConsultar: { action: 'onConsultar' },
    onExport: { action: 'onExport' },
    onAgregar: { action: 'onAgregar' },
    onImport: { action: 'onImport' },
  },
} satisfies Meta<typeof BusquedaCriteriosForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const fideicomisoInput = canvas.getByPlaceholderText('Ingrese número de fideicomiso');
    await expect(fideicomisoInput).toHaveValue('');
  },
};

export const FideicomisoFilled: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText('Ingrese número de fideicomiso');
    await userEvent.type(input, '12345');
    await expect(input).toHaveValue('12345');
  },
};

export const TipoParticipanteSelected: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox');
    await userEvent.click(trigger);
    const option = screen.getByText('Fideicomisario');
    await userEvent.click(option);
    await expect(trigger).toHaveTextContent('Fideicomisario');
  },
};

export const BothFilled: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText('Ingrese número de fideicomiso');
    await userEvent.type(input, '98765');
    const trigger = canvas.getByRole('combobox');
    await userEvent.click(trigger);
    await userEvent.click(screen.getByText('Tercero'));
    await expect(input).toHaveValue('98765');
    await expect(trigger).toHaveTextContent('Tercero');
  },
};

export const ValidationError: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Consultar' });
    await userEvent.click(button);
    const alert = canvas.getByRole('alert');
    await expect(alert).toHaveTextContent(/debe seleccionar al menos un criterio/i);
  },
};

export const SinResultados: Story = {
  args: { hasResults: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const exportBtn = canvas.getByRole('button', { name: /Exportar Consulta/ });
    await expect(exportBtn).toBeDisabled();
  },
};

export const ConResultados: Story = {
  args: { hasResults: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const exportBtn = canvas.getByRole('button', { name: /Exportar Consulta/ });
    await expect(exportBtn).toBeEnabled();
  },
};
